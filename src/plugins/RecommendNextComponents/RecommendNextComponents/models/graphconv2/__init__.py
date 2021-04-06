import random
from itertools import takewhile
from os import path
from tempfile import TemporaryDirectory

import numpy as np
import spice_completion.datasets as datasets
import torch
from deepsnap.batch import Batch
from deepsnap.dataset import GraphDataset
from graphgym.config import assert_cfg, cfg
from graphgym.model_builder import create_model
from graphgym.utils.device import auto_select_device
from PySpice.Spice.Netlist import Node
from PySpice.Spice.Parser import SpiceParser
from spice_completion.datasets import helpers as h
from torch.utils.data import DataLoader

script_dir = path.dirname(path.realpath(__file__))
SPICE_NODE_INDEX = h.component_types.index(Node)


def local_file(name):
    return path.join(script_dir, name)


def without_lines(filename, fn):
    with open(filename, "r") as f:
        contents = "".join([line for line in f.readlines() if not fn(line)])
    return contents


def load_config(filepath):
    # Load config file
    config_str = without_lines(filepath, lambda line: line.startswith("param"))
    config = cfg.load_cfg(config_str)
    cfg.merge_from_other_cfg(config)
    assert_cfg(cfg)


load_config(local_file("config.yaml"))
gclass_cfg = cfg.clone()
# Set Pytorch environment
torch.set_num_threads(cfg.num_threads)
out_dir_parent = cfg.out_dir
random.seed(cfg.seed)
np.random.seed(cfg.seed)
torch.manual_seed(cfg.seed)
auto_select_device()

# Set learning environment
model = create_model(dim_in=28, dim_out=28)
ckpt = torch.load(local_file("model.ckpt"), map_location=torch.device(cfg.device))
model.load_state_dict(ckpt["model_state"])

load_config(local_file("link/config.yaml"))
link_cfg = cfg.clone()
link_model = create_model(dim_in=28, dim_out=2)
ckpt = torch.load(local_file("link/model.ckpt"), map_location=torch.device(cfg.device))
link_model.load_state_dict(ckpt["model_state"])

mean = np.load(local_file("mean.npy"))
stddev = np.load(local_file("stddev.npy"))

link_mean = np.load(local_file("link/mean.npy"))
link_stddev = np.load(local_file("link/stddev.npy"))


def component(index, component_pin_dict):
    pins = [name for (name, prob) in component_pin_dict.get(index, [])][0:2]
    return {"type": datasets.helpers.component_index_name(index), "pins": pins}


def analyze(circuit):
    with TemporaryDirectory() as td:
        netlist_path = path.join(td, "circuit.net")
        with open(netlist_path, "w") as f:
            netlist = str(circuit)
            f.write(netlist)

        return analyze_file(netlist_path, circuit)


def get_edge_idx(graph_size, node_features):
    proto_idx = torch.tensor(range(graph_size - 1, node_features.shape[0], graph_size))
    spice_node_idx = (node_features[:, SPICE_NODE_INDEX].nonzero()).flatten()
    spice_node_count = len(
        list(takewhile(lambda idx: idx < graph_size, spice_node_idx.tolist()))
    )
    proto_idx = proto_idx.repeat_interleave(spice_node_count)
    return torch.stack([proto_idx.long(), spice_node_idx])


def connect_components(filename, batch, components):
    """ Return a dictionary of nodes to use for each possible added node"""
    source = next(h.valid_netlist_sources([filename]))
    (components, adj) = h.netlist_as_graph(source)
    adj = np.pad(adj, ((0, 1), (0, 1)))
    graphs = []
    epsilon = 0.0
    component_types = (t for t in h.component_types[1:] if t is not Node)
    for ComponentType in component_types:
        new_comps = components[:]
        new_comps.append(ComponentType.__new__(ComponentType))
        graph = datasets.LinkDataset.load_graph(new_comps, adj)
        graph.x = (graph.x - link_mean) / (link_stddev + epsilon)
        graphs.append(graph)

    graphs = h.to_deepsnap(graphs)
    cfg.merge_from_other_cfg(link_cfg)
    dataset = GraphDataset(
        graphs,
        task=cfg.dataset.task,
        edge_train_mode=cfg.dataset.edge_train_mode,
        edge_message_ratio=cfg.dataset.edge_message_ratio,
        edge_negative_sampling_ratio=cfg.dataset.edge_negative_sampling_ratio,
        minimum_node_per_graph=0,
    )
    loader = DataLoader(
        dataset, batch_size=len(graphs), collate_fn=Batch.collate(), pin_memory=False
    )
    batch = next(iter(loader))
    batch.to(torch.device(cfg.device))

    node_features = (batch.node_feature.cpu() * (link_stddev + epsilon)) + link_mean
    batch.edge_label_index = get_edge_idx(len(components) + 1, node_features)
    logits, _ = link_model(batch)
    probs = torch.sigmoid(logits)
    # Resolve the edge label indices to types and stuff
    component_types = (node_features[batch.edge_label_index[0]] > 0.99).nonzero()[:, 1]
    node_instances = (components[i % 20] for i in batch.edge_label_index[1])
    component_dict = {}
    for (component_type, node, prob) in zip(
        component_types.tolist(), node_instances, probs.tolist()
    ):
        if component_type not in component_dict:
            component_dict[component_type] = []
        component_dict[component_type].append((node.name, prob))

    for (k, v) in component_dict.items():
        v.sort(key=lambda e: -e[1])
    return component_dict


def analyze_file(filename, circuit):
    spice_dataset = datasets.omitted(
        [filename],
        min_edge_count=5,
        train=False,
        resample=False,
        mean=mean,
        std=stddev,
    )
    graphs = h.to_deepsnap(spice_dataset)
    cfg.merge_from_other_cfg(gclass_cfg)
    dataset = GraphDataset(
        graphs,
        task=cfg.dataset.task,
        edge_train_mode=cfg.dataset.edge_train_mode,
        edge_message_ratio=cfg.dataset.edge_message_ratio,
        edge_negative_sampling_ratio=cfg.dataset.edge_negative_sampling_ratio,
        minimum_node_per_graph=0,
    )
    dataset._num_graph_labels = len(datasets.helpers.component_types)

    loader = DataLoader(
        dataset, batch_size=1, collate_fn=Batch.collate(), pin_memory=False
    )
    batch = next(iter(loader))
    batch.to(torch.device(cfg.device))
    pred, true = model(batch)

    batch = next(iter(loader))
    batch.to(torch.device(cfg.device))
    component_pins = connect_components(filename, batch, h.components(circuit))
    distribution = list(
        enumerate(torch.nn.functional.softmax(pred.squeeze()).tolist())
    )[
        1:
    ]  # remove the unknown category
    predictions = [([component(i, component_pins)], prob) for (i, prob) in distribution]
    return predictions


if __name__ == "__main__":
    import json
    import sys

    filename = sys.argv[1]
    contents = next(h.valid_netlist_sources([filename]))
    parser = SpiceParser(source=contents)
    print(json.dumps(analyze_file(filename, parser.build_circuit())))
