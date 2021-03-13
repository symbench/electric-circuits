#!/usr/bin/env bash
rm -rf ~/GraphGym
git clone https://github.com/symbench/GraphGym ~/GraphGym
cd ~/GraphGym
# Temporary until PR is merged
git checkout -b 1-py38-install origin/1-py38-install
python setup.py install
cd -
