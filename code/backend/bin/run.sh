#!/bin/bash

cd "$(dirname "$0")"

(cd .. && uvicorn decision_backend.main:app --host 0.0.0.0)