#/bin/bash

cd "$(dirname "$0")/../"

bash code/backend/bin/lint.sh
bash code/frontend/bin/lint.sh
bash code/server/bin/lint.sh
