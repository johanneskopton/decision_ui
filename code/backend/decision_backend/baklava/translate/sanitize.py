"""Simple sanitization methods"""


def remove_newslines(s: str):
    """Remove any new line characters from the string."""
    return " ".join(s.splitlines())
