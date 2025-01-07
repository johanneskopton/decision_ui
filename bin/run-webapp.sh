#/bin/bash

cd "$(dirname "$0")/../"

concurrently -k -c auto -n backend,server \
    "bash code/backend/bin/run.sh" \
    "bash code/server/bin/run.sh"

