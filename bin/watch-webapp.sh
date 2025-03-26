#/bin/bash

# run both backend and frontend webapp in watch mode (auto-restart on code changes)
# uses node package "concurrently", run "npm install -g concurrently" to install it

cd "$(dirname "$0")/../"

concurrently -k -c auto -n frontend,backend "bash code/frontend/bin/watch-webapp.sh" "bash code/backend/bin/watch.sh"