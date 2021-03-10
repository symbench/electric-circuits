import os
import random
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
from torch.utils.data import DataLoader

script_dir = path.dirname(path.realpath(__file__))


def local_file(name):
    return path.join(script_dir, name)


def names():
    all_dirs = (name for name in os.listdir(script_dir) if path.isdir(name))
    model_dirs = (name for name in all_dirs if path.exists(checkpoint_path(name)))
    return model_dirs


def fetch(name):
    ckpt = torch.load(checkpoint_path(name))
    return ckpkt["model_state"]


def remove_lines(filename, fn):
    with open(filename, "r") as f:
        contents = "".join([l for l in f.readlines() if not fn(l)])
    with open(filename, "w") as f:
        f.write(contents)


# Load config file
remove_lines(local_file("config.yaml"), lambda line: line.startswith("param"))
cfg.merge_from_file(local_file("config.yaml"))
assert_cfg(cfg)

# Set Pytorch environment
torch.set_num_threads(cfg.num_threads)
out_dir_parent = cfg.out_dir
random.seed(cfg.seed)
np.random.seed(cfg.seed)
torch.manual_seed(cfg.seed)
auto_select_device()

# Set learning environment
model = create_model(dim_in=28, dim_out=28)
ckpt = torch.load(local_file("model.ckpt"))
model.load_state_dict(ckpt["model_state"])
mean = np.load(local_file("mean.npy"))
stddev = np.load(local_file("stddev.npy"))


def analyze(circuit):
    with TemporaryDirectory() as td:
        netlist_path = path.join(td, "circuit.net")
        with open(netlist_path, "w") as f:
            netlist = str(circuit)
            f.write(netlist)

        dataset = datasets.omitted(
            [netlist_path],
            min_edge_count=5,
            train=False,
            resample=False,
            mean=mean,
            std=stddev,
        )
        graphs = dataset.to_deepsnap()
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
        distribution = torch.nn.functional.softmax(pred.squeeze()).tolist()
        predictions = [
            (datasets.helpers.component_index_name(i), prob)
            for (i, prob) in enumerate(distribution)
        ]
        return dict(predictions[1:])  # remove the unknown category
