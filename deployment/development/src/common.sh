#!/bin/bash

cd "$(dirname "$0")"

# set defaults
export WORKSPACE_DIR="../../../"

# load env file overwriting defaults
[ -f "./.env" ] && export $(cat ./.env | xargs)

# use podman instead of docker
DOCKER_BASE_CMD="podman"
COMPOSE_BASE_CMD="podman-compose"

COMPOSE_PROJECT="decision-support-ui"
COMPOSE_CMD="${COMPOSE_BASE_CMD} -p ${COMPOSE_PROJECT} -f $(pwd)/src/docker-compose.yml"
