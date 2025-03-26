#!/bin/bash

# change to project directory
cd "$(dirname "$0")/../"

# setup new python virtual environment
python3 -m venv .venv

# activate python venv
source .venv/bin/activate

# install python dependencies
pip install -e .[dev]

# print currently installed libraries and their versions
python3 -m pip list
