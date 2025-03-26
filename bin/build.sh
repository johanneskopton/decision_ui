#/bin/bash

cd "$(dirname "$0")/../"

bash code/frontend/bin/build-webapp.sh
bash code/server/bin/build.sh
