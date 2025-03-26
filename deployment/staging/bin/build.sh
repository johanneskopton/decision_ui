#!/bin/bash

cd "$(dirname "$0")/../../../"

podman build --format docker -f deployment/staging/src/Dockerfile.base -t localhost/decision-support-ui/base:latest .
podman build -t localhost/decision-support-ui/server:latest -f deployment/staging/src/Dockerfile.server .