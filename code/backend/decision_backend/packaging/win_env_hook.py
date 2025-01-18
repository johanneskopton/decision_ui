"""Pyinstaller Runtime Hook for Windows.

This file sets environment variables that are used when running the bundled app.
"""

import os
import sys


os.environ["DSUI_R_SCRIPT_PATH"] = os.path.join(
    sys._MEIPASS, "resources\\R\\bin\\Rscript.exe"  # pylint: disable=protected-access, no-member
)
