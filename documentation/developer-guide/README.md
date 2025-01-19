# Developer Guide

This document provides general information and notes for developers for each supported operating system.

## Linux Development

### Development Environment

For development on Linux, we recommend using the development container image provided in the `deployment/development/src` directory in combination with [Visual Studio Code](https://code.visualstudio.com/) and the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension.

The container provides all required development dependencies, including an R installation, Python and Node.js.

You can build and run the development container using [Podman](https://podman.io/) and the bash scripts in the `deployment/development/bin` directory:

- `build.sh` - build the container image
- `up.sh` - starts the container in background mode
- `shell_server.sh` - starts an interactive shell inside the container
- `down.sh` - stops the container

Inside the container, you can use various build scripts from the `bin` directory to start developing:

- `build.sh` - build the webapp in production mode
- `clean.sh` - remove all runtime files (cache, dependencies, etc.)
- `install.sh` - install software dependencies (python packages, node modules)
- `lint.sh` - check source code style
- `package-electron.sh` - package electron app for Linux as AppImage (without R)
- `test.sh` - run unit tests
- `run-webapp.sh` - run webapp in production mode
- `watch-webapp.sh` - run webapp in development and watch for files changes

### Linux Distribution & Packaging

On Linux, there is no self-contained pre-built version of R that can be packaged alongside an electron app. Because of that, the easiest way to distribute the application is with a Docker image.

## Windows Development

### Development Environment

For development on Linux, we recommend installing Python and Node.js manually.

Afterward, you can use various batch scripts from the `bin` directory to start developing:

- `build.bat` - build the webapp in production mode
- `clean.bat` - remove all runtime files (cache, dependencies, etc.)
- `install.bat` - install software dependencies (R, python packages, node modules)
- `lint.bat` - check source code style
- `package-electron.bat` - package electron app for Windows as setup executable
- `run-webapp.bat` - run webapp in production mode
- `watch-webapp.bat` - run webapp in development and watch for files changes

### Windows Distribution & Packaging

On Windows, it is possible to distribute a pre-built version of R alongside the electron app. The `install.bat` batch file will download R and run the setup wizard in silent mode to install R in the directory `code/backend/resources/R`. All files of the R installation seem to run independently and do not require any further setup or configuration. When packaging the electron app, the R directory is simply copied. When the electron app is installed on by a user, the R directory is simply extracted and ready to go. The exact path to the `Rscript.exe` is determined in a custom Python hook, see `code/backend/decision_backend/packaging/win_env_hook.py`.

## MacOS Development

### Development Environment

For development on MacOS, we suggest installing [Podman](https://podman.io/) and following the Linux development recommendations.

### MacOS Distribution & Packaging

On MacOS, there is no self-contained pre-built version of R that can be packaged alongside an electron app. Because of that, the easiest way to distribute the application is with a Docker image.

## Environment Variables

The following environment variables will be considered when running the backend:

- `DSUI_DATABASE_PATH=./data/decision-support-ui-backend.db` \
  path to the sqlite database file
- `DSUI_R_SCRIPT_PATH=Rscript` \
  path to the `Rscript` or `Rscript.exe` binary
- `DSUI_JWT_LIFETIME=600` \
  lifetime of the JSON Web Tokens (JWT) in seconds (default is 10 minutes)
- `DSUI_LOG_LEVEL=INFO` \
  log level, show debug messages by providing `DEBUG`
- `DSUI_R_MAX_RUNTIME=30` \
  maximum runtime of R script in seconds (default 30 seconds)
- `DSUI_R_MAX_MCRUNS=100000` \
  maximum number of Monte Carlo runs that are allowed to run in the backend (default 100.000)
- `DSUI_R_MAX_BINS=200` \
  maximum number of histogram bins that can be generated in the backend (default 200)
- `DSUI_R_VALUE_PRECISION=5` \
  maximum floating point precision when writing numeric values in the R-code
- `DSUI_CORS_ORIGINS=*` \
  backend CORS origins parameter, adapt according to your deployment strategy
- `DSUI_CORS_METHODS=GET,POST` \
  backend CORS methods parameter
- `DSUI_CORS_HEADERS=*` \
  backend CORS headers parameter, adapt according to your deployment strategy
