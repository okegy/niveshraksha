import json
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request

from ..models import EducationModule
from ..security.ratelimit import client_key, limiter

router = APIRouter()

CONTENT_DIR = Path(__file__).resolve().parents[3] / "content"  # workspace/niveshraksha/content
LANGUAGES = {"en", "ta", "hi", "te", "ml", "kn", "bn", "mr", "gu", "or", "pa", "as"}


def _load_modules(language: str) -> tuple[str, list[EducationModule]]:
    """Returns (resolved_language, modules). Unknown languages are rejected
    rather than silently served English — API consumers must know what they
    got."""
    lang = language.lower().strip()
    if lang not in LANGUAGES:
        raise HTTPException(
            status_code=404,
            detail=f"No education content for language '{language}'. Supported: {sorted(LANGUAGES)}.",
        )
    path = CONTENT_DIR / lang / "modules.json"
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        return lang, [EducationModule(**m) for m in data]
    except FileNotFoundError as err:
        raise HTTPException(status_code=404, detail=f"No education content for language '{lang}'.") from err
    except Exception as err:
        # Fail safe: never emit partially-parsed educational content.
        raise HTTPException(status_code=500, detail="Education content temporarily unavailable.") from err


@router.get("/modules")
async def get_modules(http_request: Request, language: str = "en"):
    limiter.check(client_key(http_request))
    resolved, modules = _load_modules(language)
    return {
        "language": resolved,
        "modules": [m.model_dump() for m in modules],
        "note": "Educational content only — not investment advice. Sources are listed on /about.",
    }
