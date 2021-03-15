#!/usr/bin/env bash
export CUDA=cpu
rm -rf /tmp/GraphGym
git clone https://github.com/symbench/GraphGym /tmp/GraphGym
cd /tmp/GraphGym
python setup.py install
cd -
