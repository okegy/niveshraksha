"""Script-based language auto-detection — deterministic, zero-model.

Unicode block ranges identify the writing system of a message, so the UI can
show which language the engine assumed (the user's explicit `language` choice
still wins for any behaviour that depends on it).
"""
from collections import Counter

_RANGES = {
    "ta": (0x0B80, 0x0BFF),   # Tamil
    "hi": (0x0900, 0x097F),   # Devanagari (Hindi)
    "te": (0x0C00, 0x0C7F),   # Telugu
    "ml": (0x0D00, 0x0D7F),   # Malayalam
    "kn": (0x0C80, 0x0CFF),   # Kannada
}
# Latin script cannot distinguish en from romanised Indian languages; treat
# it as en for display purposes.
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
