"""Privacy tests: redaction of Indian identifiers before storage or logging."""
from app.security.redaction import redact_text, scrub_for_logs


def test_pan_redacted():
    assert "[PAN REDACTED]" in redact_text("my PAN is ABCDE1234F please")
    assert "ABCDE1234F" not in redact_text("my PAN is ABCDE1234F please")


def test_aadhaar_redacted():
    out = redact_text("aadhaar 1234 5678 9012 end")
    assert "[AADHAAR REDACTED]" in out
    assert "5678" not in out


def test_phone_redacted():
    out = redact_text("call me on 9876543210 or +91 98765 43210")
    assert "9876543210" not in out.replace("[PHONE REDACTED]", "")
    assert "[PHONE REDACTED]" in out


def test_email_redacted():
    out = redact_text("mail victim.name@gmail.com now")
    assert "[EMAIL REDACTED]" in out


def test_upi_id_redacted():
    out = redact_text("pay to scammer99@ybl immediately")
    assert "[UPI ID REDACTED]" in out
    assert "scammer99@ybl" not in out


def test_otp_value_redacted_but_word_kept():
    out = redact_text("your OTP is 4821, enter quickly")
    assert "4821" not in out
    assert "OTP" in out


def test_normal_text_untouched():
    text = "Please review the mutual fund factsheet from 2026 and share feedback."
    assert redact_text(text) == text


def test_log_scrub_strips_secrets():
    out = scrub_for_logs("request failed for password=hunter2 and api_key=sk-abc123")
    assert "hunter2" not in out
    assert "sk-abc123" not in out
