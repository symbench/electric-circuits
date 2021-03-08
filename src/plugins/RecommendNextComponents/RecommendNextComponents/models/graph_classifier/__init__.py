import os
from os import path

from graphgym.config import (cfg, assert_cfg)
import torch

script_dir = path.dirname(path.realpath(__file__))

def local_file(name):
    return path.join(script_dir, name)

def names():
    all_dirs = ( name for name in os.listdir(script_dir) if path.isdir(name) )
    model_dirs = ( name for name in all_dirs if path.exists(checkpoint_path(name)) )
    return model_dirs

def fetch(name):
    ckpt = torch.load(checkpoint_path(name))
    return ckpkt['model_state']

# TODO: load the model
# Load config file
cfg.merge_from_file(local_file('config.yaml'))
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
ckpt = torch.load(local_file('model.ckpt'))
model.load_state_dict(ckpt['model_state'])

def analyze(circuit):
    netlist = str(circuit)
    # TODO: encode the netlist
    for loader in loaders:
        for batch in loader:
            batch.to(torch.device(cfg.device))
            pred, true = model(batch)
            print(torch.argmax(torch.nn.functional.softmax(pred), dim=1).tolist(), f'({true.tolist()})')

