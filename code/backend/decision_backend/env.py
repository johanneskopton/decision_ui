import os

DSUI_R_SCRIPT_PATH = os.environ.get("DSUI_R_SCRIPT_PATH", "Rscript")
DSUI_R_MAX_RUNTIME = int(os.environ.get("DSUI_R_MAX_RUNTIME", "10"))  # in seconds
DSUI_R_MAX_MCRUNS = int(os.environ.get("DSUI_R_MAX_MCRUNS", "100000"))
DSUI_R_MAX_BINS = int(os.environ.get("DSUI_MAX_HISTOGRAM_BINS", "200"))

DSUI_CORS_ORIGINS = os.environ.get("DSUI_CORS_ORIGINS", "*")
DSUI_CORS_METHODS = os.environ.get("DSUI_CORS_ORIGINS", "GET,POST")
DSUI_CORS_HEADERS = os.environ.get("DSUI_CORS_ORIGINS", "*")
