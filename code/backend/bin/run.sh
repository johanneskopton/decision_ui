#!/bin/bash

# run backend in production mode

# change to project directory
cd "$(dirname "$0")/../"

# activate venv
source .venv/bin/activate

# start server
uvicorn decision_backend.main:app --host 0.0.0.0