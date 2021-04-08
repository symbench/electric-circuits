#!/usr/bin/env bash
export CUDA=cpu
rm -rf /tmp/GraphGym
rm -rf /tmp/spice-completion

git clone https://github.com/symbench/GraphGym /tmp/GraphGym
cd /tmp/GraphGym
python setup.py install
cd -

git clone https://github.com/symbench/spice-completion /tmp/spice-completion
cd /tmp/spice-completion
python -m pip install .
cd -
