#!/bin/bash

# change to project directory
cd "$(dirname "$0")/../"

# activate venv
source .venv/bin/activate

pyinstaller --onefile --hidden-import aiosqlite --name decision-support-ui-backend decision_backend/cli.py