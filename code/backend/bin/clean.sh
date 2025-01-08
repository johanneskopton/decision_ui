#!/bin/bash

# removes all build and runtime files

# change to project directory
cd "$(dirname "$0")/../"

# remove files
rm -rf build
rm -rf decision_backend.egg-info
rm -rf .venv
rm -rf .pytest_cache
rm -rf decision_backend/__pycache__
rm -f decision-support-ui-backend.db
