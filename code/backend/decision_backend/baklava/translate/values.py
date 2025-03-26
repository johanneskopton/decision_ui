"""Translate values"""

import numpy as np

from decision_backend.env import DSUI_R_VALUE_PRECISION


def round_to_precision(x, p=DSUI_R_VALUE_PRECISION):
    """Round value to a limited precision."""
    return np.around(x, p)
