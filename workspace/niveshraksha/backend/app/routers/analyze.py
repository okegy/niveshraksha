import json
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, HTTPException, Request

from ..analyzers.language_detect import detect_script_language
from ..analyzers.scam_rules import ScamAnalyzer
from ..analyzers.url_rules import UrlAnalyzer
from ..models import (
    AnalysisRequest,
    AnalysisResponse,
    RedFlag,
    RiskLevel,
    UrlAnalysisRequest,
    UrlAnalysisResponse,
)
from ..security.ratelimit import client_key, limiter
from ..security.redaction import redact_text
from ..storage import save_analysis

router = APIRouter()
analyzer = ScamAnalyzer()
url_analyzer = UrlAnalyzer()

SAFE_NEXT_STEPS = [
    "Do not send money or share documents until you have verified independently.",
    "Never share OTPs, UPI PINs, passwords, or remote-access codes.",
    "Verify claims directly on the official website — type the address yourself, "
    "do not use links from the message.",
    "If you have already shared information or money, report it at cybercrime.gov.in immediately.",
    "Save the message as evidence if you plan to report the incident.",
]

LIMITATIONS = [
    "This is a rule-based safety analysis, not investment, legal, or regulatory advice.",
    "A 'no obvious red flags' result does not prove legitimacy — new scam patterns may not be covered.",
    "A flag is a potential warning sign, not proof of fraud — legitimate messages can trigger patterns too.",
]


def _respond(
    input_type: str,
    risk_level: RiskLevel,
    flags: list,
    summary: str,
    content: str,
    verified: list | None = None,
) -> dict:
    """Build the response, persist a redacted snapshot, and keep the
    analysis_id stable so the frontend can deep-link to /result/[id]."""
    result: dict[str, Any] = {
        "analysis_id": "",  # filled after persistence
        "risk_level": risk_level,
        "summary": summary,
        "red_flags": [f.model_dump() for f in flags],
        "what_we_verified": verified or [],
        "safe_next_steps": SAFE_NEXT_STEPS if flags else [
            "Stay cautious — no rule-based check can prove a message is safe.",
            "Verify any financial claim directly on the official website.",
        ],
        "limitations": LIMITATIONS,
        "created_at": datetime.now(UTC),
        "detected_language": detect_script_language(content),
        "ml_metadata": {},
    }
    # Advisory ML signal — computed for text only; rules remain the decider.
    if input_type == "message":
        from ..ml.classifiers import assistive_score

        result["ml_metadata"] = assistive_score(content)
    # Persist the result with user content already redacted.
    redacted_snapshot = dict(result)
    redacted_snapshot["red_flags"] = [
        {**f, "matched_text": redact_text(f["matched_text"])} for f in result["red_flags"]
    ]
    analysis_id = save_analysis(
        input_type=input_type,
        risk_level=risk_level.value,
        rules_triggered=sorted({f["code"] for f in result["red_flags"]}),
        result_json=json.dumps(redacted_snapshot, default=str, ensure_ascii=False),
    )
    result["analysis_id"] = analysis_id
    return result


@router.post("/message", response_model=AnalysisResponse)
async def analyze_message(request: AnalysisRequest, http_request: Request):
    limiter.check(client_key(http_request))
    flags = analyzer.analyze_text(request.content)
    risk_level = analyzer.risk_tier(flags)
    return _respond("message", risk_level, flags, analyzer.summary_for(risk_level), request.content)


@router.post("/url", response_model=UrlAnalysisResponse)
async def analyze_url(request: UrlAnalysisRequest, http_request: Request):
    limiter.check(client_key(http_request))
    flags = url_analyzer.analyze_url(request.url)
    risk_level = url_analyzer.risk_tier(flags)
    result = _respond("url", risk_level, flags, url_analyzer.summary_for(risk_level), request.url)
    return UrlAnalysisResponse(
        analysis_id=result["analysis_id"],
        risk_level=risk_level,
        summary=result["summary"],
        red_flags=[RedFlag(**f) for f in result["red_flags"]],
        safe_next_steps=result["safe_next_steps"],
        limitations=result["limitations"],
        created_at=result["created_at"],
    )


@router.get("/{analysis_id}")
async def get_analysis(analysis_id: str):
    """Fetch a previously created analysis by id (for /result/[id])."""
    from ..storage import get_analysis as _get

    row = _get(analysis_id)
    if row is None:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found or expired. Results are retained for a short period only.",
        )
    data = json.loads(row.result_snapshot)
    data["analysis_id"] = row.id
    data["created_at"] = row.created_at
    data["input_type"] = row.input_type
    return data
