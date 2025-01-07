#!/bin/bash

cd "$(dirname "$0")/../"

npm install

# create symbolic link to documentation directory
if [ ! -d public/static/documentation ]; then
    ln -sfh ../../../../documentation public/static/documentation
fi