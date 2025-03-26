#!/bin/bash

# removes all build and runtime files

# change to project directory
cd "$(dirname "$0")/../"

# remove files
rm -rf dist
rm -rf node_modules
rm -rf resources/decision-support-ui-backend