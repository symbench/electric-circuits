import random
from os import path
from tempfile import TemporaryDirectory

import numpy as np
import torch
from deepsnap.batch import Batch
from deepsnap.dataset import GraphDataset
from graphgym.config import assert_cfg, cfg
from graphgym.model_builder import create_model
from graphgym.utils.device import auto_select_device
from PySpice.Spice.Netlist import Node
from PySpice.Spice.Parser import SpiceParser
from spice_completion.datasets import PrototypeLinkDataset
from spice_completion.datasets import helpers as h
from torch.utils.data import DataLoader

SPICE_NODE_INDEX = h.component_types.index(Node)
script_dir = path.dirname(path.realpath(__file__))


def local_file(name):
    return path.join(script_dir, name)


def without_lines(filename, fn):
    with open(filename, "r") as f:
        contents = "".join([line for line in f.readlines() if not fn(line)])
    return contents


# Load config file
config_str = without_lines(
    local_file("config.yaml"), lambda line: line.startswith("param")
)
config = cfg.load_cfg(config_str)
cfg.merge_from_other_cfg(config)
assert_cfg(cfg)

# Set Pytorch environment
torch.set_num_threads(cfg.num_threads)
out_dir_parent = cfg.out_dir
random.seed(cfg.seed)
np.random.seed(cfg.seed)
torch.manual_seed(cfg.seed)
auto_select_device()

# Set learning environment
model = create_model(dim_in=29, dim_out=2)
ckpt = torch.load(local_file("model.ckpt"))
model.load_state_dict(ckpt["model_state"])
mean = np.load(local_file("mean.npy"))
stddev = np.load(local_file("stddev.npy"))


def node(index, components):
    return components[index]


def component(index, edges):
    return {
        "type": h.component_index_name(index),
        "pins": [edge.name for edge in edges],
    }


def get_proto_node_edges(node_features):
    proto_nodes = node_features[:, -1].nonzero()
    spice_nodes = (node_features[:, SPICE_NODE_INDEX].nonzero()).flatten()[
        0:-1
    ]  # last node is proto node (remove it!)
    proto_idx = (
        torch.ones((proto_nodes.shape[0], spice_nodes.shape[0])) * proto_nodes
    ).flatten()
    spice_node_idx = spice_nodes.repeat(proto_nodes.shape[0])
    return torch.stack([proto_idx.long(), spice_node_idx])


def interpret_results(edges, node_features, probs, components):
    proto_ids = edges[0]
    proto_types = (node_features[proto_ids, 0:-1] > 0.99).nonzero()[:, 1]
    proto_edges = {}
    for (i, p_id) in enumerate(proto_ids):
        node_id = edges[1][i].item()
        prob = probs[i].item()
        p_id = p_id.item()
        if p_id not in proto_edges:
            proto_edges[p_id] = []

        proto_edges[p_id].append((node_id, prob))

    proto_top_edges = (
        (k, zip(*sorted(edges, key=lambda e: -e[1])[0:2]))
        for (k, edges) in proto_edges.items()
    )
    protos_w_probs = [
        (
            component(proto_types[k], (node(e, components) for e in edges)),
            sum(probs) / len(probs),
        )
        for (k, (edges, probs)) in proto_top_edges
    ]
    print("protos_w_probs", protos_w_probs)
    return protos_w_probs


def analyze(circuit):
    with TemporaryDirectory() as td:
        netlist_path = path.join(td, "circuit.net")
        with open(netlist_path, "w") as f:
            netlist = str(circuit)
            f.write(netlist)

        return analyze_file(netlist_path, h.components(circuit))


def analyze_file(filename, circuit):
    netlists = [filename]
    dataset = PrototypeLinkDataset(netlists, mean=mean, std=stddev, train=False)
    graphs = h.to_deepsnap(dataset)
    ds_dataset = GraphDataset(
        graphs,
        task=cfg.dataset.task,
        edge_train_mode=cfg.dataset.edge_train_mode,
        edge_message_ratio=cfg.dataset.edge_message_ratio,
        edge_negative_sampling_ratio=cfg.dataset.edge_negative_sampling_ratio,
        minimum_node_per_graph=0,
    )
    loader = DataLoader(
        ds_dataset, batch_size=1, collate_fn=Batch.collate(), pin_memory=False
    )

    batch = next(iter(loader))
    batch.to(torch.device(cfg.device))
    node_features = dataset.unnormalize(batch.node_feature.cpu())
    batch.edge_label_index = get_proto_node_edges(node_features)
    logits, _ = model(batch)
    probs = torch.sigmoid(logits)
    return interpret_results(
        batch.edge_label_index, node_features, probs, h.components(circuit)
    )


if __name__ == "__main__":
    import sys

    filename = sys.argv[1]
    contents = next(h.valid_netlist_sources([filename]))
    parser = SpiceParser(source=contents)
    analyze_file(filename, parser.build_circuit())
