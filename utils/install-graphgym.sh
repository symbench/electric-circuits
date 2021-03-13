#!/usr/bin env bash
git clone https://github.com/symbench/GraphGym
cd GraphGym
# Temporary until PR is merged
git checkout -b 1-py38-install origin/1-py38-install
python setup.py install

