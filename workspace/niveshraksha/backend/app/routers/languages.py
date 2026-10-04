"""Language registry — the configurable language list from the master prompt.

`validated` reflects evaluation evidence only. A language is NOT claimed
supported until its language-specific evaluation set passes
(tests/test_model_eval.py). Urdu stays unvalidated: script handling and
content quality are not evaluated in this build.
"""
from fastapi import APIRouter, Request

from ..analyzers.scam_rules import RULES
from ..security.ratelimit import client_key, limiter

router = APIRouter()

LANGUAGES: list[dict] = [
    {"code": "en", "name": "English", "native": "English", "validated": True},
    {"code": "ta", "name": "Tamil", "native": "தமிழ்", "validated": True},
    {"code": "hi", "name": "Hindi", "native": "हिंदी", "validated": True},
    {"code": "te", "name": "Telugu", "native": "తెలుగు", "validated": True},
    {"code": "ml", "name": "Malayalam", "native": "മലയാളം", "validated": True},
    {"code": "kn", "name": "Kannada", "native": "ಕನ್ನಡ", "validated": True},
    {"code": "bn", "name": "Bengali", "native": "বাংলা", "validated": True},
    {"code": "mr", "name": "Marathi", "native": "मराठी", "validated": True},
    {"code": "gu", "name": "Gujarati", "native": "ગુજરાતી", "validated": True},
    {"code": "or", "name": "Odia", "native": "ଓଡ଼ିଆ", "validated": True},
    {"code": "pa", "name": "Punjabi", "native": "ਪੰਜਾਬੀ", "validated": True},
    {"code": "as", "name": "Assamese", "native": "অসমীয়া", "validated": True},
    {"code": "ur", "name": "Urdu", "native": "اردو", "validated": False,
     "note": "Not claimed supported: script handling and content quality are not yet evaluated."},
]


@router.get("")
async def list_languages(http_request: Request):
    limiter.check(client_key(http_request))
    return {
        "languages": LANGUAGES,
        "rule_count": len(RULES),
        "note": "'validated' means the language-specific evaluation set passes; "
                "languages are added incrementally only after evaluation.",
    }
