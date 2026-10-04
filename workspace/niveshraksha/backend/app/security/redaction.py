"""PII redaction. Applied BEFORE anything is stored or logged.

This is defense-in-depth for a hackathon demo, not a compliance guarantee.
Patterns cover the most common Indian identifiers.
"""
import re

REDACTIONS = [
    (re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b"), "[PAN REDACTED]"),
    (re.compile(r"\b\d{4}\s?\d{4}\s?\d{4}\b"), "[AADHAAR REDACTED]"),
    (re.compile(r"\b(?:\+91[\-\s]?)?[6-9]\d{9}\b"), "[PHONE REDACTED]"),
    # Spaced Indian mobile numbers, e.g. 98765 43210 or +91 98765 43210
    (re.compile(r"\b(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]\d{5}\b"), "[PHONE REDACTED]"),
    (re.compile(r"\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b"), "[EMAIL REDACTED]"),
    # UPI ids like name@bank / name@paytm / name@ybl
    (re.compile(r"\b[a-zA-Z0-9.\-_]{2,}@(?:ok(?:hdfcbank|icici|axis|sbi)|paytm|ybl|apl|ibl|upi)\b", re.IGNORECASE), "[UPI ID REDACTED]"),
    # Card-shaped numbers (13-19 digits with optional separators, cheap Luhn-free heuristic)
    (re.compile(r"\b(?:\d[ -]?){13,19}\b"), "[CARD/ACCOUNT REDACTED]"),
    # Bank account numbers: 9-18 consecutive digits not already consumed above
    (re.compile(r"\b\d{9,18}\b"), "[ACCOUNT REDACTED]"),
    # OTP / PIN mentions keep the word but strip any 4-8 digit code near them
    (re.compile(r"\b(otp|upi\s*pin|pin|password|cvv)\b(?:\s+(?:is|code|number|no\.?|:|=))*[:\s]*\d{4,8}\b", re.IGNORECASE), r"\1 [REDACTED]"),
]


def redact_text(text: str) -> str:
    for pattern, replacement in REDACTIONS:
        text = pattern.sub(replacement, text)
    return text


# Pattern used by the logging filter to scrub any message/URL/body that leaks
# into a log record.
LOG_SCRUB = re.compile(
    r"(?:otp|upi[_-]?pin|password|token|secret|api[_-]?key|authorization)\s*[:=]\s*\S+",
    re.IGNORECASE,
)


def scrub_for_logs(text: str) -> str:
    text = LOG_SCRUB.sub(lambda m: m.group(0).split(":")[0].split("=")[0] + "= [REDACTED]", text)
    return redact_text(text)
