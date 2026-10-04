"""Official-source registry and advisor lookup.

Every verification goes through this adapter so the UI can show source name,
URL, freshness, and the exact mode used (mock / live / unavailable). The mock
fixture is clearly labelled synthetic data — it is never presented as
regulator data.
"""
import json
from datetime import UTC, datetime
from pathlib import Path

SOURCES_DIR = Path(__file__).parent
MOCK_ADVISORS_PATH = SOURCES_DIR / "mock_advisors.json"

SEBI_INTERMEDIARIES_URL = "https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13"
CYBERCRIME_URL = "https://cybercrime.gov.in"

_cache: dict | None = None
_loaded_at: datetime | None = None


def _load_fixture() -> dict:
    global _cache, _loaded_at
    if _cache is None:
        try:
            with open(MOCK_ADVISORS_PATH, encoding="utf-8") as f:
                _cache = json.load(f)
                _loaded_at = datetime.now(UTC)
        except Exception:
            _cache = {"advisors": []}
    return _cache


def fixture_freshness() -> datetime:
    _load_fixture()
    return _loaded_at or datetime.now(UTC)


def search_advisor(
    name: str | None = None,
    registration_number: str | None = None,
    firm_name: str | None = None,
) -> tuple[str, str, dict | None]:
    """Returns (status, match_quality, matched_record).

    status: verified | not_found | unavailable
    'not_found' in the MOCK fixture does NOT mean the advisor is fraudulent —
    it means we could not verify. The caller must surface that uncertainty.
    """
    data = _load_fixture()
    advisors: list[dict] = data.get("advisors", [])

    if registration_number:
        reg = registration_number.strip().upper()
        for adv in advisors:
            if adv.get("reg_no", "").upper() == reg:
                return "verified", "exact", adv
        return "not_found", "exact", None

    query = (name or firm_name or "").strip().lower()
    if not query:
        return "not_found", "none", None

    matches = [adv for adv in advisors if query in adv.get("name", "").lower()]
    if len(matches) == 1:
        return "verified", "partial", matches[0]
    if len(matches) > 1:
        return "not_found", "ambiguous", None
    return "not_found", "none", None


def all_source_statuses() -> list:
    """Status of every official source the product references."""
    now = datetime.now(UTC)
    return [
        {
            "source_name": "SEBI Registered Intermediaries Database (demo fixture)",
            "source_url": SEBI_INTERMEDIARIES_URL,
            "status": "mock_mode",
            "mode": "mock",
            "last_checked": fixture_freshness().isoformat(),
        },
        {
            "source_name": "National Cyber Crime Reporting Portal",
            "source_url": CYBERCRIME_URL,
            "status": "reference_link_only",
            "mode": "static",
            "last_checked": now.isoformat(),
        },
        {
            "source_name": "SEBI Scores Complaint Portal",
            "source_url": "https://scores.sebi.gov.in",
            "status": "reference_link_only",
            "mode": "static",
            "last_checked": now.isoformat(),
        },
    ]
