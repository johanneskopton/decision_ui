#!/bin/bash

cd "$(dirname "$0")"

(cd .. && pip install -e .[dev])