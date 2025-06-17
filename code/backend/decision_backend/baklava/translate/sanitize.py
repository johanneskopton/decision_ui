"""Simple sanitization methods"""

import re
import unicodedata

RE_LATIN = "a-zA-Z"
RE_NUMBERS = "0-9"
RE_GERMAN = "äÄüÜöÖß"
RE_VIETNAMESE = (
    "àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹý"
    + "ÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝ"
)  # source: https://stackoverflow.com/a/46265018


def remove_newslines(s: str):
    """Remove any new line characters from the string."""
    return " ".join(s.splitlines())


def remove_unsafe_characters(s: str):
    """Remove any"""
    s_normalized = unicodedata.normalize("NFC", s)
    return re.sub(rf"[^ {RE_LATIN}{RE_NUMBERS}{RE_GERMAN}{RE_VIETNAMESE}\_]", "", s_normalized)
