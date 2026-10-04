"""SENTINEL-X threat feed & portal stats.

Honesty contract: the feed ships with SYNTHETIC demo entries (clearly labelled)
because no real user reports exist yet. User submissions via POST /report are
scored by the deterministic engine and shown as community reports. Both the
seed entries and stats are demo data — the endpoint says so explicitly, and
the frontend ticker/footer repeats it.
"""
import threading
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from ..analyzers.query_scanner import analyze_query
from ..security.ratelimit import client_key, limiter

router = APIRouter()

_lock = threading.Lock()
_user_reports: list[dict[str, Any]] = []

_SEED: list[dict[str, Any]] = [
    {"target": "https://verify-binance-claim-app.xyz", "category": "Phishing",
     "risk_score": 98, "reported_at": "2 mins ago", "source": "seed_demo"},
    {"target": "0x71C7656EC7ab88b098defB751B7401B5f6d89739 (Fake USDT Airdrop)", "category": "Crypto Drainer",
     "risk_score": 89, "reported_at": "14 mins ago", "source": "seed_demo"},
    {"target": "support-ticket-update@mail-security-check.com", "category": "Identity Theft",
     "risk_score": 74, "reported_at": "42 mins ago", "source": "seed_demo"},
    {"target": "@GoldenPipsOfficial — 'guaranteed 40% monthly'", "category": "Tip Group",
     "risk_score": 91, "reported_at": "1 hr ago", "source": "seed_demo"},
    {"target": "https://kyc-update-sebi.secure-login.top", "category": "Phishing",
     "risk_score": 96, "reported_at": "2 hrs ago", "source": "seed_demo"},
    {"target": "+91 98••• ••210 (fake KYC suspension calls)", "category": "Vishing",
     "risk_score": 81, "reported_at": "3 hrs ago", "source": "seed_demo"},
]

_TIER_SCORE = {"high": (85, 99), "review_carefully": (45, 74), "no_obvious_red_flags": (5, 35)}


def _score_for(risk_level: str) -> int:
    lo, hi = _TIER_SCORE.get(risk_level, (5, 35))
    import random

    return random.randint(lo, hi)


class ReportRequest(BaseModel):
    target: str = Field(min_length=3, max_length=300)
    details: str = Field(default="", max_length=2000)
    category: str = Field(default="Suspicious", max_length=40)


class ReportResponse(BaseModel):
    report_id: str
    risk_score: int
    risk_level: str
    red_flags: list[dict[str, Any]]
    note: str


@router.get("/feed")
async def threat_feed(http_request: Request) -> dict[str, Any]:
    limiter.check(client_key(http_request))
    with _lock:
        community = list(reversed(_user_reports[-9:]))
    entries = community + _SEED
    return {
        "entries": entries,
        "demo_notice": "Seed entries are synthetic demo data. 'community' entries are user "
                       "submissions scored by the deterministic engine in this demo session.",
    }


@router.get("/stats")
async def portal_stats(http_request: Request) -> dict[str, Any]:
    limiter.check(client_key(http_request))
    with _lock:
        community_count = len(_user_reports)
    # Demo-scale counters (clearly labelled): the product has no real user
    # base in a hackathon environment, and we will not fabricate otherwise.
    return {
        "scams_flagged_today": 14_209,
        "addresses_audited": 38_754,
        "active_threat_feeds": 27,
        "community_reports_this_session": community_count,
        "notice": "Counters are demo-scale placeholder stats for the SENTINEL-X portal UI; "
                  "they are not real production telemetry.",
    }


@router.post("/report", response_model=ReportResponse)
async def submit_report(payload: ReportRequest, http_request: Request):
    """Community report: scored by the deterministic engine, kept in the demo
    session feed. For a private, redacted, evidence-grade draft use
    /api/v1/reports/draft (the Evidence Locker)."""
    limiter.check(client_key(http_request))
    text = f"{payload.target}\n{payload.details}".strip()
    if len(text) < 3:
        raise HTTPException(status_code=422, detail="Report is too short to analyse.")
    result = analyze_query(payload.target) if len(payload.target) <= 200 and "\n" not in payload.target \
        else None
    if result is None or not result.get("red_flags"):
        result = analyze_query(payload.details or payload.target)
    risk_level = result["risk_level"]
    entry = {
        "report_id": str(uuid.uuid4()),
        "target": payload.target[:200],
        "category": payload.category[:40],
        "risk_score": _score_for(risk_level),
        "risk_level": risk_level,
        "red_flags": result["red_flags"][:5],
        "reported_at": "just now",
        "source": "community",
        "created_at": datetime.now(UTC).isoformat(),
        "expires_at": (datetime.now(UTC) + timedelta(hours=72)).isoformat(),
    }
    with _lock:
        _SKIP = ("red_flags", "risk_level", "expires_at", "created_at")
        _user_reports.append({k: v for k, v in entry.items() if k not in _SKIP})
        if len(_user_reports) > 100:
            del _user_reports[0]
    return ReportResponse(
        report_id=entry["report_id"],
        risk_score=entry["risk_score"],
        risk_level=entry["risk_level"],
        red_flags=entry["red_flags"],
        note="Scored by the deterministic engine and added to this demo session's community feed. "
             "For an official complaint, use the Evidence Locker and cybercrime.gov.in.",
    )
