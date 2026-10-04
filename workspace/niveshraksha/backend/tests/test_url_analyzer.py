"""URL analyzer tests: static checks only, no network access."""
from app.analyzers.url_rules import UrlAnalyzer
from app.models import RiskLevel

analyzer = UrlAnalyzer()


def codes(flags):
    return {f.code for f in flags}


def test_https_clean_domain_is_calm():
    flags = analyzer.analyze_url("https://www.sebi.gov.in/sebiweb/home/HomeAction.do")
    assert RiskLevel.no_obvious_red_flags == analyzer.risk_tier(flags)


def test_http_flagged():
    flags = analyzer.analyze_url("http://kyc-update.info/login")
    assert "NO_HTTPS" in codes(flags)


def test_shortener_flagged():
    flags = analyzer.analyze_url("https://bit.ly/3xYzAbC")
    assert "URL_SHORTENER" in codes(flags)


def test_ip_literal_flagged():
    flags = analyzer.analyze_url("https://192.168.1.10/pay")
    assert "IP_LITERAL_HOST" in codes(flags)
    assert "PRIVATE_ADDRESS" in codes(flags)
    assert RiskLevel.high == analyzer.risk_tier(flags)


def test_punycode_flagged():
    flags = analyzer.analyze_url("https://xn--sebi-2ve.gov-example.com")
    assert "PUNYCODE_HOST" in codes(flags)


def test_brand_in_subdomain_flagged():
    flags = analyzer.analyze_url("https://sebi.secure-login.xyz.com/kyc")
    assert "BRAND_IN_SUBDOMAIN_PATH" in codes(flags)


def test_brand_on_own_domain_not_flagged():
    flags = analyzer.analyze_url("https://www.sebi.gov.in/about")
    assert "BRAND_IN_SUBDOMAIN_PATH" not in codes(flags)


def test_embedded_credentials_flagged():
    flags = analyzer.analyze_url("https://user:pass@evil-example.com/login")
    assert "EMBEDDED_CREDENTIALS" in codes(flags)


def test_high_abuse_tld_flagged():
    flags = analyzer.analyze_url("https://investor-help-desk.xyz/login")
    assert "SUSPICIOUS_TLD" in codes(flags)


def test_no_network_call_is_made():
    """Guard the no-fetch security stance: analyzing must not touch sockets."""
    import socket

    class Boom(socket.socket):
        def __init__(self, *a, **k):
            raise AssertionError("URL analyzer must not open network sockets")

    original = socket.socket
    socket.socket = Boom
    try:
        analyzer.analyze_url("https://some-random-domain-that-does-not-exist.example")
    finally:
        socket.socket = original


def test_malformed_input_does_not_crash():
    flags = analyzer.analyze_url("   ")
    assert isinstance(flags, list)
