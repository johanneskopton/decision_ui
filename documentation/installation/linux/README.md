# Linux Installation

## Container Installation on Linux

On Linux, you can install the application using [Docker](https://www.docker.com/), [Podman](https://podman.io/) or
similar container management tools. Please follow their respective installation instructions, or install the tools
from the software repository of your favorite Linux distribution.

The following instructions are based on Fedora Linux and Podman.

### Start the Container

You can run the server container with the following command:

```
podman run \
    --rm -it \
    -v $(pwd):/root/workspace/code/backend/data:Z \
    -p 8080:8080 \
    -e DSUI_SECRET=default_secret \
    docker.io/knopflogik/inres_decision-support-ui_server:latest
```

The following arguments can to be provided:

- `--rm` \
  delete the container after stopping it
- `-it` \
  run container as an interactive terminal
- `-v /path/to/some/directory:/root/workspace/code/backend/data` \
  mount the data directory such that models are stored permanently on the host machine
  (append `:Z` on Linux distributions with [SELinux](https://en.wikipedia.org/wiki/Security-Enhanced_Linux))
- `-e DSUI_SECRET=default_secret` \
  specify a custom secret (random characters, similar to a password) to ensure that the application can securely
  encrypt login data

Additional environment variables are described in the "Developers Guide" section.

As soon as the application is started, you can access the user interface from your browser using the address:
[`http://localhost:8080`](http://localhost:8080).

You can stop the application by typing `CTRL + C` in the terminal.

### Build the Container Image

To build the container image yourself, download the source code from GitHub:

```
git clone https://github.com/johanneskopton/decision_ui.git
```

You can find the necessary files in the directory `deployment/staging`. For performance reasons, the Dockerfile is
split into two files:

- `Dockerfile.base`: installs basic build and software dependencies
- `Dockerfile.server`: installs and runs the application

Both images need to be built before the application can be started.

```
podman build -f deployment/staging/src/Dockerfile.base -t localhost/decision-support-ui/base:latest .
podman build -f deployment/staging/src/Dockerfile.server -t localhost/decision-support-ui/server:latest .
```

Building the base image will download, compile and install R and the
[decisionSupport](https://cran.r-project.org/web/packages/decisionSupport/index.html) package from CRAN.
This process might take a long time (up to 30 minutes). Building the server image should only take a few seconds.

Then, you can start the Decision Support UI using the same `podman run` command (see above), except that you need to
replace the last parameter with `localhost/decision-support-ui/server:latest`.

## Installation from Source

In all other scenarios, you may also install the decision support user interface from its source code. There are three
main requirements:

- [Python 3](https://www.python.org) (tested with v3.13.0)
- [Node.js](https://nodejs.org/) (tested with v22.11.0)
- [R](https://www.r-project.org/) (tested with v4.4.2)

### Install R and the `decisionSupport` package

Please follow the respective installation instructions of R for your Linux distribution.

In addition, you need to install the
[`decisionSupport`](https://cran.r-project.org/web/packages/decisionSupport/index.html) package and `readr` package
from CRAN. You can install them with the following R command:

```
install.packages(c("decisionSupport", "readr"))
```

The application needs to know the correct location of the R executable file. In case the `Rscript` command is available
on your terminal, Python should detect it and use it by default. Otherwise, specify the environment variable
`DSUI_R_SCRIPT_PATH` with your custom path to the `Rscript` executable file. Make sure that the respective R
environment contains the required packages. Run the following R commands and verify that there are no error messages:

```
library(readr);
library(decisionSupport);
```

### Install Python

For Python, please follow the official [installation instructions](https://docs.python.org/3/using/index.html).
Make sure that the `python` command is available in your terminal.

### Install Node.js

For Node.js, please follow the official [installation instructions](https://nodejs.org/en/download). Make sure that the
`node` and `npm` commands are available in your terminal. Also install the Javascript tool
[`concurrently`](https://www.npmjs.com/package/concurrently) by executing:

```
npm install -g concurrently
```

### Download Source Code and Install Dependencies

Download the source code from GitHub:

```
git clone https://github.com/johanneskopton/decision_ui.git
```

Install further software libraries (python packages and Javascript libraries) by executing the bash script
`bin/install.sh`.

### Build the application

You can build the application by executing the bash script `bin/build.sh`.

### Run the application

You can start the application by executing the bash script `bin/run-webapp.sh`.
