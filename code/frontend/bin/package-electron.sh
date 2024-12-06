#!/bin/bash

cd "$(dirname "$0")/../"

# clean dist directory
rm -rf dist
mkdir dist

# copy python distributable
rm -rf resources/decision-support-ui-backend
cp -R ../backend/dist/decision-support-ui-backend resources/decision-support-ui-backend

npm run build:electron:linux