"""Suspicious-URL checker — static analysis only.

Security stance: this module never opens, fetches, or resolves the URL
against the network. Every check is performed on the string itself. That
removes the SSRF attack surface entirely (no outbound requests, no DNS
rebinding, no redirect following) and is safe for a hackathon demo.

Checks: scheme, IP-literal hosts, private-address literals, URL shorteners,
punycode/lookalike homoglyphs, brand keywords in deceptive positions,
embedded credentials, excessive subdomains, and non-standard ports.
"""
import re
from urllib.parse import urlparse

from ..models import RedFlag, RiskLevel

URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly",
    "cutt.ly", "rebrand.ly", "tiny.cc", "shorturl.at", "rb.gy", "t.ly",
    "bit.do", "s.id", "lnkd.in", "shorte.st",
}

# Indian financial brands scammers commonly imitate. Used only to flag
# *deceptive placement* (e.g. "sbi-secure-login.example.com"), never to bless
# a URL as legitimate.
BRANDS = ["sebi", "rbi", "hdfc", "icici", "sbi", "axisbank", "kotak", "zerodha", "groww", "upstox", "paytm", "phonepe", "googlepay", "gpay"]

# Common homoglyph substitutes used in lookalike domains.
HOMOGLYPHS = {"0": "o", "1": "l", "3": "e", "5": "s", "vv": "w", "rn": "m", "1i": "h"}

PRIVATE_RANGES = (
    ("10.", "private (10.0.0.0/8)"),
    ("192.168.", "private (192.168.0.0/16)"),
    ("127.", "loopback (127.0.0.0/8)"),
    ("169.254.", "link-local"),
)

RULE_META = {
    "NO_HTTPS": ("No HTTPS (unencrypted connection)", "The link does not use HTTPS. Any information entered on such a page travels in the clear. Note: HTTPS alone does NOT mean a site is genuine — scam sites use HTTPS too.", "high"),
    "URL_SHORTENER": ("Link shortener hides the real destination", "The destination is hidden behind a shortener. Expand the link (e.g. using the shortener's preview feature) and inspect the real domain before trusting it.", "medium"),
    "IP_LITERAL_HOST": ("Host is a raw IP address", "The link points to a bare IP address instead of a domain name. Genuine financial institutions always use proper domain names.", "high"),
    "PRIVATE_ADDRESS": ("Host points to a private/internal address", "This link targets a private network address. It is not a public website and cannot be a genuine institution.", "high"),
    "PUNYCODE_HOST": ("Possible lookalike (homoglyph) domain", "The domain uses punycode or lookalike characters that can imitate a real brand (e.g. 'sébi' vs 'sebi'). Compare the domain character by character.", "high"),
    "BRAND_IN_SUBDOMAIN_PATH": ("Brand name used in a deceptive position", "The domain name contains a financial brand in a subdomain or path (e.g. 'sebi.xyz.com' or 'xyz.com/sebi-login'). Real institutions use their brand only in their own registered domain.", "high"),
    "EMBEDDED_CREDENTIALS": ("Username/password embedded in link", "The link embeds credentials before the host ('user:pass@host'), a tactic used to confuse readers about the real destination.", "high"),
    "EXCESSIVE_SUBDOMAINS": ("Unusually deep subdomain chain", "The domain has many subdomain levels, a common trick to bury the real domain and show a trusted-looking word first.", "medium"),
    "SUSPICIOUS_TLD": ("Domain uses a high-abuse extension", "The domain ends in an extension frequently abused for phishing. Treat links on such domains with extra caution.", "medium"),
    "NONSTANDARD_PORT": ("Non-standard web port", "The link uses an unusual port, which genuine public websites almost never do.", "medium"),
    "ENTROPY_DOMAIN": ("Random-looking domain name", "The domain looks like random characters rather than words — typical of throwaway phishing domains.", "medium"),
}

HIGH_ABUSE_TLDS = {"zip", "mov", "top", "xyz", "click", "link", "gq", "cf", "tk", "ml"}

# Minimal multi-label suffix approximation so "sebi.gov.in" resolves its
# registrable domain to "sebi.gov.in", not "gov.in".
MULTI_LABEL_SUFFIXES = (
    "gov.in", "nic.in", "edu.in", "ac.in", "org.in", "co.in", "net.in", "res.in",
    "co.uk", "gov.uk", "ac.uk", "org.uk", "com.au", "net.au", "org.au", "co.za", "com.br",
)


def _registrable(host: str) -> str:
    labels = host.split(".")
    for n in (3, 2):
        if len(labels) >= n and ".".join(labels[-n:]) in MULTI_LABEL_SUFFIXES:
            return ".".join(labels[-(n + 1):])
    return ".".join(labels[-2:]) if len(labels) >= 2 else host


def _flag(code: str, matched: str) -> RedFlag:
    label, explanation, severity = RULE_META[code]
    return RedFlag(code=code, label=label, explanation=explanation, matched_text=matched, severity=severity)


class UrlAnalyzer:
    """Static URL checker. It does not access the network, ever."""

    def analyze_url(self, raw: str) -> list[RedFlag]:
        flags: list[RedFlag] = []
        url = raw.strip()
        parsed = urlparse(url if "://" in url else "http://" + url)
        host = (parsed.hostname or "").lower()
        suffix = parsed.scheme.lower()

        if not host:
            return [_flag("ENTROPY_DOMAIN", url[:60])]

        if suffix == "https":
            pass
        elif suffix == "http":
            flags.append(_flag("NO_HTTPS", url[:60]))
        else:
            # Odd schemes (javascript:, data:, file:) are inherently unsafe.
            flags.append(_flag("NONSTANDARD_PORT", f"scheme:{suffix}"))

        if host in URL_SHORTENERS:
            flags.append(_flag("URL_SHORTENER", host))

        if re.fullmatch(r"\d{1,3}(\.\d{1,3}){3}", host):
            flags.append(_flag("IP_LITERAL_HOST", host))
            for prefix, _scope in PRIVATE_RANGES:
                if host.startswith(prefix):
                    flags.append(_flag("PRIVATE_ADDRESS", host))
                    break

        # Private IPv6 literals and bracketed hosts.
        if host.startswith("[") or re.match(r"^fd[0-9a-f]{2}:|^fe80:", host):
            flags.append(_flag("PRIVATE_ADDRESS", host))

        if "xn--" in host or any(ord(c) > 127 for c in host):
            flags.append(_flag("PUNYCODE_HOST", host))

        if "@" in (parsed.netloc or ""):
            flags.append(_flag("EMBEDDED_CREDENTIALS", parsed.netloc[:60]))

        # Brand in subdomain or path, but not the registrable domain itself.
        labels = host.split(".")
        registrable = _registrable(host)
        for brand in BRANDS:
            if brand in registrable:
                # Brand owns the domain — no deceptive-placement flag, but we
                # still cannot confirm ownership from a string alone.
                continue
            if any(brand in lbl for lbl in labels[:-2]) or brand in parsed.path.lower():
                flags.append(_flag("BRAND_IN_SUBDOMAIN_PATH", host + parsed.path[:40]))
                break

        if len(labels) > 4:
            flags.append(_flag("EXCESSIVE_SUBDOMAINS", host))

        tld = labels[-1] if labels else ""
        if tld in HIGH_ABUSE_TLDS:
            flags.append(_flag("SUSPICIOUS_TLD", "." + tld))

        if parsed.port and parsed.port not in (80, 443):
            flags.append(_flag("NONSTANDARD_PORT", str(parsed.port)))

        if re.search(r"[0-9a-z]{8,}\.(com|net|org|info|in)$", host) and not re.search(r"(bank|invest|fund|fin|pay|sebi)", host):
            stripped = re.sub(r"[-.]?(\d+)?\.(com|net|org|info|in)$", "", host)
            if re.fullmatch(r"[a-z0-9]{10,}", stripped.replace("-", "")) and re.search(r"[bcdfghjklmnpqrstvwxz]{5}", stripped):
                flags.append(_flag("ENTROPY_DOMAIN", host))

        return flags

    @staticmethod
    def risk_tier(flags: list[RedFlag]) -> RiskLevel:
        if any(f.severity == "high" for f in flags):
            return RiskLevel.high
        if flags:
            return RiskLevel.review_carefully
        return RiskLevel.no_obvious_red_flags

    @staticmethod
    def summary_for(risk_level: RiskLevel) -> str:
        return {
            RiskLevel.high: "This link shows serious warning signs of a phishing or scam page. Do not open it, and never enter passwords, OTPs, or payment details on it.",
            RiskLevel.review_carefully: "This link shows some potential warning signs. If you must proceed, inspect the full domain carefully and never enter sensitive information.",
            RiskLevel.no_obvious_red_flags: "No obvious red flags were found by our static check. This does NOT prove the site is safe — the page was not opened, and HTTPS never guarantees legitimacy.",
        }[risk_level]
