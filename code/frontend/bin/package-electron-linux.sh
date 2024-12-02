#!/bin/bash

cd "$(dirname "$0")/../"

# clean dist directory
rm -rf dist
mkdir dist

# copy python distributable
mkdir -p resources/python
cp ../backend/dist/decision-support-ui-backend resources/python/decision-support-ui-backend

VITE_BACKEND_BASE_URL="http://127.0.0.1:8000" npm run build:electron:linux