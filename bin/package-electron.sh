#/bin/bash

# package both frontend and backend as electron app for linux

cd "$(dirname "$0")/../"

bash code/backend/bin/package.sh
bash code/frontend/bin/package-electron.sh