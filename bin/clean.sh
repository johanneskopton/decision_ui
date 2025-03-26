#/bin/bash

cd "$(dirname "$0")/../"

bash code/frontend/bin/clean.sh
bash code/backend/bin/clean.sh
bash code/server/bin/clean.sh