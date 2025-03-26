#!/bin/bash

# run backend in developer mode, watching for file changes

# change to project directory
cd "$(dirname "$0")/../"

# activate venv
source .venv/bin/activate

# start server
python -m decision_backend.cli --host 0.0.0.0 --port 8000 --reload -v