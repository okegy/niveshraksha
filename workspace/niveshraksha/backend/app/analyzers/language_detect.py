"""Script-based language auto-detection — deterministic, zero-model.

Unicode block ranges identify the writing system of a message, so the UI can
show which language the engine assumed (the user's explicit `language` choice
still wins for any behaviour that depends on it).
"""
from collections import Counter

_RANGES = {
    "ta": (0x0B80, 0x0BFF),   # Tamil
    "hi": (0x0900, 0x097F),   # Devanagari (Hindi; also Marathi)
    "te": (0x0C00, 0x0C7F),   # Telugu
    "ml": (0x0D00, 0x0D7F),   # Malayalam
    "kn": (0x0C80, 0x0CFF),   # Kannada
    "bn": (0x0980, 0x09FF),   # Bengali script (also Assamese)
    "pa": (0x0A00, 0x0A7F),   # Gurmukhi (Punjabi)
    "gu": (0x0A80, 0x0AFF),   # Gujarati
    "or": (0x0B00, 0x0B7F),   # Odia
}
# Latin script cannot distinguish en from romanised Indian languages; treat
# it as en for display purposes.
# Devanagari is shared by Hindi/Marathi and Bengali script by Bengali/Assamese;
# the API reports the script-level code and the UI clarifies.
DEFAULT = "en"


def detect_script_language(text: str) -> str:
    counts: Counter = Counter()
    for ch in text:
        code = ord(ch)
        for lang, (low, high) in _RANGES.items():
            if low <= code <= high:
                counts[lang] += 1
                break
    if not counts:
        return DEFAULT
    return counts.most_common(1)[0][0]
