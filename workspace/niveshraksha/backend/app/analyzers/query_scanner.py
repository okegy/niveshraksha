"""Unified query scanner for the SENTINEL-X portal search bar.

Classifies a pasted URL / crypto address / email / Telegram handle / phone
number / free text and routes it to the right engine, returning one consistent
shape. Honesty rules apply everywhere: pattern-level checks only, no fake
on-chain or registry lookups, unknown ≠ safe, and official reporting channels
are always included (Chakshu/Sanchar Saathi for phone scams in India).
"""
import re
from typing import Any

from .language_detect import detect_script_language
from .scam_rules import ScamAnalyzer
from .url_rules import UrlAnalyzer

try:  # reporting routes live in the report router
    from ..routers.report import REPORTING_ROUTES
except Exception:  # pragma: no cover
    REPORTING_ROUTES = []

_analyzer = ScamAnalyzer()
_url_analyzer = UrlAnalyzer()

ETH = re.compile(r"^0x[a-fA-F0-9]{40}$")
BTC = re.compile(r"^(bc1[a-z0-9]{20,62}|[13][a-km-zA-HJ-NP-Z1-9]{25,62})$")
TRON = re.compile(r"^T[1-9A-HJ-NP-Z]{33}$")
EMAIL = re.compile(r"^[\w.+-]+@[\w-]+\.[\w.-]{2,}$")
TELEGRAM = re.compile(r"^@?[A-Za-z][A-Za-z0-9_]{4,31}$")
PHONE = re.compile(r"^(?:\+?91[\-\s]?)?[6-9]\d{9}$")
URLISH = re.compile(r"^(https?://)?[\w-]+(\.[\w-]+)+(/.*)?$", re.I)

DISPOSABLE_DOMAINS = {
    "mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com",
    "yopmail.com", "trashmail.com", "sharklasers.com", "getnada.com",
}
BRAND_DOMAIN_LOOKALIKES = ["sbi", "hdfc", "icici", "axis", "kotak", "paytm", "phonepe", "googlepay", "gpay", "sebi", "binance", "coinbase", "wazirx", "paypal", "amazon", "flipkart"]
COMMON_PROVIDERS = {"gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "rediffmail.com"}
TYPO_PROVIDERS = {"gmai1.com", "gmail.co", "gmailcm", "hotmial.com", "outlok.com", "yaho.com", "gnail.com"}


def _flag(code: str, label: str, explanation: str, matched: str, severity: str) -> dict[str, str]:
    return {"code": code, "label": label, "explanation": explanation,
            "matched_text": matched, "severity": severity}


def classify(query: str) -> str:
    q = query.strip()
    if ETH.match(q) or BTC.match(q) or TRON.match(q):
        return "crypto"
    if EMAIL.match(q):
        return "email"
    if URLISH.match(q) and "." in q:
        return "url"
    if q.startswith("@") or (TELEGRAM.match(q) and " " not in q and not q.isdigit()):
        return "telegram"
    if PHONE.match(q.replace(" ", "").replace("-", "")):
        return "phone"
    return "text"


def analyze_crypto(q: str) -> dict[str, Any]:
    coin = "Ethereum/EVM" if ETH.match(q) else "Bitcoin" if BTC.match(q) else "TRON"
    return {
        "risk_level": "review_carefully",
        "red_flags": [
            _flag("CRYPTO_ONCHAIN_UNAVAILABLE", "On-chain audit not available in demo",
                  "This build cannot inspect blockchain history, contract approvals, or drainer "
                  "reports. An address with no visible history can still be a drainer.", q[:24] + "…", "medium"),
            _flag("CRYPTO_IRREVERSIBLE", "Crypto payments are irreversible",
                  "If you send crypto to a scammer, it is effectively unrecoverable. Verify the "
                  "address through the official app or website you opened yourself — never through "
                  "a link someone sent you.", coin, "medium"),
        ],
        "guidance": [
            f"Recognised {coin} address format. Format validity does NOT mean the address is safe.",
            "Check the address on a block explorer you open yourself (e.g. etherscan.io for EVM) — "
            "look for prior victim reports and drainer tags.",
            "Never share your seed phrase or private key; no genuine service needs them.",
            "Beware 'send X to receive 2X' airdrop/giveaway promises — always fraudulent.",
        ],
    }


def analyze_email(q: str) -> dict[str, Any]:
    domain = q.split("@", 1)[1].lower()
    flags: list[dict[str, str]] = []
    if domain in TYPO_PROVIDERS:
        flags.append(_flag("EMAIL_TYPO_PROVIDER", "Lookalike of a common email provider",
                           f"'{domain}' is a typo/lookalike of a major provider (e.g. gmail.com). "
                           "This is a classic phishing sender trick.", domain, "high"))
    if re.search(r"(secure|security|verify|login|update|account|support|billing|kyc|wallet)-", domain):
        flags.append(_flag("EMAIL_PHISHING_SHAPE", "Phishing-style service domain",
                           "The domain combines service words ('secure', 'verify', 'support', "
                           "'login'…) in the hyphenated pattern typical of phishing infrastructure "
                           "rather than a company's real mail domain.", domain, "medium"))
    if domain in DISPOSABLE_DOMAINS:
        flags.append(_flag("EMAIL_DISPOSABLE", "Disposable email service",
                           "The sender uses a throwaway email service commonly seen in fraud campaigns.",
                           domain, "medium"))
    for brand in BRAND_DOMAIN_LOOKALIKES:
        if brand in domain.replace(".", "") and domain not in COMMON_PROVIDERS and \
           not domain.endswith(".gov.in") and f"{brand}." not in f"{domain}.":
            flags.append(_flag("EMAIL_BRAND_IMPERSONATION", "Brand name inside a suspicious domain",
                               f"The domain contains '{brand}' but does not belong to the company's "
                               "official domain. Verify through the company's official website.",
                               domain, "high"))
            break
    level = "high" if any(f["severity"] == "high" for f in flags) else \
            "review_carefully" if flags else "no_obvious_red_flags"
    return {
        "risk_level": level,
        "red_flags": flags,
        "guidance": [
            "No public identity registry is queried in this demo — checks are pattern-based only.",
            "A clean pattern result does NOT prove the sender is genuine.",
            "Never open attachments or pay 'processing/unlock' fees from unexpected senders.",
        ],
    }


def analyze_telegram(q: str) -> dict[str, Any]:
    handle = q.lstrip("@").lower()
    flags: list[dict[str, str]] = []
    impersonation_hits = [b for b in BRAND_DOMAIN_LOOKALIKES if b in handle]
    if impersonation_hits or re.search(r"(official|admin|support|sebi|rbi|verified)", handle):
        flags.append(_flag("HANDLE_IMPERSONATION_RISK", "Handle mimics an official/brand identity",
                           "Scam channels frequently use 'official', 'support', 'admin', or brand "
                           "names in their handles. Verify through the company's own website — "
                           "never through the handle itself.", q, "medium"))
    if re.search(r"(tip|signal|pump|profit|stock|forex|crypto|ipo)", handle):
        flags.append(_flag("HANDLE_TIP_GROUP_PATTERN", "Tip-group style handle",
                           "Handles advertising tips/signals/pumps are characteristic of "
                           "pump-and-dump groups. Treat all their 'guaranteed profit' claims as "
                           "red flags.", q, "medium"))
    return {
        "risk_level": "review_carefully" if flags else "no_obvious_red_flags",
        "red_flags": flags,
        "guidance": [
            "No social-platform registry is queried in this demo — checks are pattern-based only.",
            "Forward the channel's actual messages to the Message tab for the full red-flag analysis.",
            "Report fraudulent channels inside WhatsApp/Telegram, and at cybercrime.gov.in.",
        ],
    }


def analyze_phone(q: str) -> dict[str, Any]:
    return {
        "risk_level": "no_obvious_red_flags",
        "red_flags": [],
        "guidance": [
            "No public phone registry is queried in this demo — a clean result is NOT a safety certificate.",
            "Report scam calls/SMS to the Chakshu portal (Sanchar Saathi): sancharsaathi.gov.in — "
            "the official government channel, or 1906/1930 for fraud.",
            "Never share OTPs/PINs with callers, even if they quote your name or ID.",
        ],
    }


def analyze_query(query: str) -> dict[str, Any]:
    q = query.strip()[:2000]
    qtype = classify(q)
    if qtype == "crypto":
        res = analyze_crypto(q)
    elif qtype == "email":
        res = analyze_email(q)
    elif qtype == "telegram":
        res = analyze_telegram(q)
    elif qtype == "phone":
        res = analyze_phone(q)
    elif qtype == "url":
        flags = _url_analyzer.analyze_url(q)
        tier = _url_analyzer.risk_tier(flags)
        res = {"risk_level": tier.value, "red_flags": [f.model_dump() for f in flags],
               "guidance": ["The link was never opened or fetched (SSRF-safe static review).",
                            "HTTPS alone never proves legitimacy."]}
    else:
        flags = _analyzer.analyze_text(q)
        tier = _analyzer.risk_tier(flags)
        res = {"risk_level": tier.value, "red_flags": [f.model_dump() for f in flags],
               "guidance": ["Deterministic rule-based analysis of the text; no AI decided this result."]}
    res["query_type"] = qtype
    res["detected_language"] = detect_script_language(q)
    res["reporting_routes"] = REPORTING_ROUTES
    return res
