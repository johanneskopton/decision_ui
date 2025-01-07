#/bin/bash

cd "$(dirname "$0")/../"

bash code/backend/bin/install.sh
bash code/frontend/bin/install.sh
bash code/server/bin/install.sh
