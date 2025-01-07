#!/bin/bash

cd "$(dirname "$0")/../"

podman run \
    --rm -it \
    -v ./data:/root/workspace/code/backend/data:Z \
    -p 8080:8080 \
    -e DSUI_SECRET=default_secret \
    localhost/decision-support-ui/server:latest
