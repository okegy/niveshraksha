"""API integration tests — FastAPI TestClient against the real app (SQLite tmp db)."""
import os
import tempfile

os.environ["NIVESHRAKSHA_DB_PATH"] = os.path.join(tempfile.gettempdir(), "nr_test.db")
os.environ.setdefault("NIVESHRAKSHA_RETENTION_HOURS", "72")

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

PROHIBITED_TOKENS = [
    "you should buy", "you should sell", "we recommend buying",
    "expected return", "price target", "guaranteed profit if you invest",
    "you should hold", "strong buy",
]


def assert_no_advice(payload):
    text = str(payload).lower()
    for token in PROHIBITED_TOKENS:
        assert token not in text, f"Prohibited advice phrase leaked: {token}"


# --- Health -------------------------------------------------------------------

def test_health_and_ready():
    assert client.get("/health").json()["status"] == "ok"
    assert client.get("/ready").json()["status"] == "ready"


# --- Message analysis ----------------------------------------------------------

def test_analyze_message_high_risk():
    r = client.post("/api/v1/analyze/message", json={
        "content": "Guaranteed 40% monthly return! Act now, only 2 slots left. Share OTP to register.",
        "language": "en",
    })
    assert r.status_code == 200
    data = r.json()
    assert data["risk_level"] == "high"
    assert len(data["red_flags"]) >= 2
    assert data["analysis_id"]
    assert all(f["matched_text"] for f in data["red_flags"])
    assert_no_advice(data)


def test_analyze_message_clean_has_honest_limitations():
    r = client.post("/api/v1/analyze/message", json={"content": "What is a mutual fund expense ratio?"})
    data = r.json()
    assert data["risk_level"] == "no_obvious_red_flags"
    assert any("does NOT prove" in s or "not prove" in s for s in [data["summary"]] + data["limitations"])
    assert_no_advice(data)


def test_analyze_message_review_carefully_tier():
    r = client.post("/api/v1/analyze/message", json={"content": "Limited slots for the exclusive offer."})
    assert r.json()["risk_level"] == "review_carefully"


def test_analyze_response_has_required_sections():
    r = client.post("/api/v1/analyze/message", json={"content": "guaranteed 30% return, act now"})
    data = r.json()
    for key in ("summary", "red_flags", "safe_next_steps", "limitations", "analysis_id"):
        assert key in data
    assert len(data["safe_next_steps"]) >= 3
    assert len(data["limitations"]) >= 2


def test_analyze_rejects_oversized_input():
    r = client.post("/api/v1/analyze/message", json={"content": "x" * 20001})
    assert r.status_code == 422


def test_get_analysis_roundtrip():
    r = client.post("/api/v1/analyze/message", json={"content": "guaranteed 25% return"})
    analysis_id = r.json()["analysis_id"]
    fetched = client.get(f"/api/v1/analyze/{analysis_id}")
    assert fetched.status_code == 200
    assert fetched.json()["analysis_id"] == analysis_id


def test_get_unknown_analysis_is_404_with_safe_message():
    r = client.get("/api/v1/analyze/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404
    assert "expired" in r.json()["detail"].lower() or "not found" in r.json()["detail"].lower()


# --- URL analysis ---------------------------------------------------------------

def test_analyze_url_phishing_patterns():
    r = client.post("/api/v1/analyze/url", json={"url": "http://sebi.kyc-update.xyz/login"})
    data = r.json()
    assert data["risk_level"] == "high"
    expected = ("NO_HTTPS", "SUSPICIOUS_TLD", "BRAND_IN_SUBDOMAIN_PATH")
    assert any(f["code"] in expected for f in data["red_flags"])
    assert "not opened" in data["note"].lower()
    assert_no_advice(data)


def test_analyze_url_clean():
    r = client.post("/api/v1/analyze/url", json={"url": "https://www.sebi.gov.in"})
    assert r.json()["risk_level"] == "no_obvious_red_flags"


# --- Advisor verification --------------------------------------------------------

def test_verify_advisor_found_in_fixture():
    r = client.post("/api/v1/verify/advisor", json={"registration_number": "INA000000001"})
    data = r.json()
    assert data["status"] == "verified"
    assert data["match_quality"] == "exact"
    # Verified results must still carry the demo-fixture uncertainty note.
    assert "DEMO FIXTURE" in data["uncertainty_note"].upper()
    assert_no_advice(data)


def test_verify_advisor_not_found_is_honestly_uncertain():
    r = client.post("/api/v1/verify/advisor", json={"name": "Totally Unknown Advisor"})
    data = r.json()
    assert data["status"] == "not_found"
    assert "not mean" in data["uncertainty_note"]
    assert_no_advice(data)


def test_verify_requires_at_least_one_field():
    assert client.post("/api/v1/verify/advisor", json={}).status_code == 422


# --- Reports / evidence locker ----------------------------------------------------

def test_draft_without_consent_is_not_stored():
    r = client.post("/api/v1/reports/draft", json={
        "user_session_id": "sess-1",
        "content": "scammer me@x.com",
        "consent_storage": False,
    })
    data = r.json()
    assert data["draft_id"] == "local-only"
    assert "NOT saved" in data["retention_note"]


def test_draft_with_consent_redacts_and_expires():
    r = client.post("/api/v1/reports/draft", json={
        "user_session_id": "sess-1",
        "content": "contact 9876543210 and aadhaar 1234 5678 9012",
        "notes": "whatsapp scam",
        "consent_storage": True,
    })
    data = r.json()
    assert data["draft_id"] != "local-only"
    assert "9876543210" not in data["redacted_content"]
    assert "1234 5678 9012" not in data["redacted_content"]
    assert data["expires_at"] > data["created_at"]


def test_draft_list_and_delete():
    s = {"user_session_id": "sess-delete"}
    r = client.post("/api/v1/reports/draft", json={**s, "content": "evidence one", "consent_storage": True})
    draft_id = r.json()["draft_id"]
    listed = client.get("/api/v1/reports/draft", params=s).json()["drafts"]
    assert any(d["draft_id"] == draft_id for d in listed)
    assert client.delete(f"/api/v1/reports/draft/{draft_id}", params=s).json()["deleted"] is True
    assert client.get(f"/api/v1/reports/draft/{draft_id}", params=s).status_code == 404


def test_reporting_routes_official_only():
    routes = client.get("/api/v1/reports/routes").json()["routes"]
    urls = {r_["url"] for r_ in routes}
    assert "https://cybercrime.gov.in" in urls
    assert "https://scores.sebi.gov.in" in urls


# --- Education & sources -----------------------------------------------------------

def test_education_modules_english():
    r = client.get("/api/v1/education/modules", params={"language": "en"})
    data = r.json()
    assert len(data["modules"]) >= 7
    assert all("content" in m and m["content"] for m in data["modules"])


def test_education_modules_tamil():
    r = client.get("/api/v1/education/modules", params={"language": "ta"})
    data = r.json()
    assert data["language"] == "ta"
    assert "மோசடி" in data["modules"][0]["title"]


def test_education_modules_all_six_languages():
    expected_first_title = {
        "hi": "घोटाले की चेतावनी संकेत",
        "te": "మోసం హెచ్చరిక సూచనలు",
        "ml": "തട്ടിപ്പ് മുന്നറിയിപ്പ് ലക്ഷണങ്ങൾ",
        "kn": "ವಂಚನೆ ಎಚ್ಚರಿಕೆ ಸೂಚನೆಗಳು",
    }
    for lang, title in expected_first_title.items():
        r = client.get("/api/v1/education/modules", params={"language": lang})
        assert r.status_code == 200, lang
        data = r.json()
        assert data["language"] == lang
        assert len(data["modules"]) >= 7, lang
        assert data["modules"][0]["title"] == title, lang
        assert all(m["content"] for m in data["modules"]), lang


def test_education_rejects_unknown_language():
    r = client.get("/api/v1/education/modules", params={"language": "fr"})
    assert r.status_code == 404


# --- Sources & provenance ---------------------------------------------------------

def test_sources_status_transparency():
    r = client.get("/api/v1/sources/status")
    data = r.json()
    assert any(s["mode"] == "mock" for s in data["sources"])
    assert any("cybercrime" in s["source_url"] for s in data["sources"])
    assert len(data["snapshot_checksum"]) == 64


def test_source_records_audit_trail():
    client.get("/api/v1/sources/status")
    r = client.get("/api/v1/sources/records")
    records = r.json()["records"]
    assert len(records) >= 3  # at least one snapshot of the three sources
    assert all(rec["checksum"] for rec in records)
    assert any("cybercrime" in rec["source_url"] for rec in records)
