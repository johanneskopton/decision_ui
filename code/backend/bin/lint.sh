#!/bin/bash

# lint backend with various tools

# change to project directory
cd "$(dirname "$0")/../"

# activate venv
source .venv/bin/activate

# run pylint
pylint --max-line-length=120 --min-similarity-lines=8 ./decision_backend
pylint --max-line-length=120 --min-similarity-lines=8 ./tests

# run flake8
flake8 --ignore=D301,W503 --max-line-length=120 ./decision_backend
flake8 --ignore=D301,W503 --max-line-length=120 ./tests

# run bandit
bandit -c .bandit.yaml -r ./decision_backend