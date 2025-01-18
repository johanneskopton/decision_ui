"""Environment variables that can be used to configure the backend behavior."""

import os

DSUI_DATABASE_PATH = os.environ.get("DSUI_DATABASE_PATH", "./data/decision-support-ui-backend.db")
"""Path to the database file"""

DSUI_R_SCRIPT_PATH = os.environ.get("DSUI_R_SCRIPT_PATH", "Rscript")
"""Path to the R binary Rscript"""

DSUI_R_MAX_RUNTIME = float(os.environ.get("DSUI_R_MAX_RUNTIME", "10"))
"""Maximum runtime when running any R script in seconds"""

DSUI_R_MAX_MCRUNS = int(os.environ.get("DSUI_R_MAX_MCRUNS", "100000"))
"""Maximum number of Monte Carlo runs when evaluating a model on user request"""

DSUI_R_MAX_BINS = int(os.environ.get("DSUI_MAX_HISTOGRAM_BINS", "200"))
"""Maximum number of histogram bins that can be calculated on user request"""

DSUI_R_VALUE_PRECISION = int(os.environ.get("DSUI_R_VALUE_PRECISION", "5"))
"""Maximum precision (floating point digits) when translating numbers into the R-code"""

DSUI_CORS_ORIGINS = os.environ.get("DSUI_CORS_ORIGINS", "*")
"""Origins parameter of the CORS configuration"""

DSUI_CORS_METHODS = os.environ.get("DSUI_CORS_METHODS", "GET,POST")
"""Methods parameter of the CORS configuration"""

DSUI_CORS_HEADERS = os.environ.get("DSUI_CORS_HEADERS", "*")
"""Headers parameter of the CORS configuration"""
