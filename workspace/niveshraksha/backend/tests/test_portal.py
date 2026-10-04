"""SENTINEL-X portal backend: unified query scanner + threat feed."""
import os
import tempfile

os.environ["NIVESHRAKSHA_DB_PATH"] = os.path.join(tempfile.gettempdir(), "nr_test.db")
os.environ.setdefault("NIVESHRAKSHA_RATE_LIMIT_PER_MIN", "10000")

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_query_classifier_routes_each_type():
    cases = {
        "http://sebi.kyc-update.xyz/login": ("url", "high"),
        "https://clean-example.gov.in": ("url", "no_obvious_red_flags"),
        "0x71C7656EC7ab88b098defB751B7401B5f6d89739": (
            "crypto", "review_carefully"),
        "support-ticket-update@mail-security-check.com": (
            "email", "review_carefully"),
        "@CryptoTipsOfficial": ("telegram", "review_carefully"),
        "9876543210": ("phone", "no_obvious_red_flags"),
        "Guaranteed 40% return, act now, share OTP": ("text", "high"),
    }
    for query, (want_type, want_level) in cases.items():
        r = client.post("/api/v1/analyze/query", json={"query": query})
        data = r.json()
        assert data["query_type"] == want_type, (query, data["query_type"])
        assert data["risk_level"] == want_level, (query, data["risk_level"])
        assert data["guidance"]
        assert_no_advice(data)


def test_crypto_and_email_honesty_guidance():
    r = client.post("/api/v1/analyze/query", json={"query": "0x" + "a" * 40})
    data = r.json()
    labels = [f["label"].lower() for f in data["red_flags"]]
    assert any("not available" in lb or "unavailable" in lb for lb in labels), data["red_flags"]
    assert any("seed phrase" in g for g in data["guidance"])


def test_threat_feed_seed_and_stats():
    feed = client.get("/api/v1/threatfeed/feed").json()
    assert len(feed["entries"]) >= 5
    assert all("demo" in feed["demo_notice"] for _ in [0])
    stats = client.get("/api/v1/threatfeed/stats").json()
    assert stats["scams_flagged_today"] > 0
    assert "placeholder" in stats["notice"]


def test_community_report_scored_by_engine():
    r = client.post("/api/v1/threatfeed/report", json={
        "target": "http://fake-sbi-approval.xyz",
        "details": "callers say KYC frozen, pay fee to unlock withdrawal",
        "category": "Phishing",
    })
    data = r.json()
    assert 40 <= data["risk_score"] <= 100
    assert data["risk_level"] in ("high", "review_carefully")
    assert data["red_flags"]
    # appears in the feed as a community entry
    feed = client.get("/api/v1/threatfeed/feed").json()["entries"]
    assert any(e["source"] == "community" for e in feed)


def test_report_too_short_rejected():
    short = client.post(
        "/api/v1/threatfeed/report", json={"target": "x", "details": "", "category": "Phishing"}
    )
    assert short.status_code == 422


def assert_no_advice(payload):
    text = str(payload).lower()
    for token in ["you should buy", "you should sell", "we recommend buying", "price target", "strong buy"]:
        assert token not in text, f"prohibited advice phrase leaked: {token}"
