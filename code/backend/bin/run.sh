#!/bin/bash

# run backend in production mode

# change to project directory
cd "$(dirname "$0")/../"

# activate venv
source .venv/bin/activate

# start server
python -m decision_backend.cli "$@"