#!/bin/bash

# test backend

# change to project directory
cd "$(dirname "$0")/../"

# activate venv
source .venv/bin/activate

# run pylint
pytest