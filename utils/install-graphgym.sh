#!/usr/bin/env bash
export CUDA=cpu
rm -rf ~/GraphGym
git clone https://github.com/symbench/GraphGym ~/GraphGym
cd ~/GraphGym
python setup.py install
cd -
