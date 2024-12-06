#!/bin/bash

# change to project directory
cd "$(dirname "$0")/../"

# activate venv
source .venv/bin/activate

pyinstaller \
    --onedir \
    --hidden-import aiosqlite \
    --hidden-import decision_backend.main \
    --collect-data decision_backend.translation.templates \
    --name decision-support-ui-backend \
    --noconfirm \
    decision_backend/cli.py
