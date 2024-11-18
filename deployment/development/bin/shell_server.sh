#!/bin/bash

cd "$(dirname "$0")/../"
source ./src/common.sh

${DOCKER_BASE_CMD} exec -it ${COMPOSE_PROJECT}_server_1 /bin/bash