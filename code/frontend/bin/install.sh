#!/bin/bash

cd "$(dirname "$0")/../"

npm install

# create symbolic link to documentation directory
ln -fs ../../../../documentation public/static/documentation