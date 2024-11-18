#!/bin/bash

cd "$(dirname "$0")/../../../"

podman build --format docker -f deployment/staging/src/Dockerfile.base -t registry.gitlab.knopflogik.de/uni-bonn/decision-support-ui/base:latest .
podman build -t localhost/decision-support-ui:staging -f deployment/staging/src/Dockerfile.server .