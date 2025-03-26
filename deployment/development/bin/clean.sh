#!/bin/bash

cd "$(dirname "$0")/../"
source ./src/common.sh

${DOCKER_BASE_CMD} builder prune --filter type=exec.cachemount