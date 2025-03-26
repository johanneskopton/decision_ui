
VERSION_TAG=latest

podman tag localhost/decision-support-ui/server:latest docker.io/knopflogik/inres_decision-support-ui_server:${VERSION_TAG}
podman login docker.io
podman push docker.io/knopflogik/inres_decision-support-ui_server:${VERSION_TAG}