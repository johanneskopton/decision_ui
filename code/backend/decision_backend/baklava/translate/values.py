import numpy as np

PRECISION = 5


def round_to_precision(x, p=PRECISION):
    return np.around(x, p)
