#!/bin/bash

cd "$(dirname "$0")/../"
source ./src/common.sh

${COMPOSE_CMD} pull
${COMPOSE_CMD} build