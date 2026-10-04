# Risk Rules — the deterministic red-flag engine

The safety engine lives in `backend/app/analyzers/`. It is **deterministic**: the same input always produces the same flags, and every flag carries the exact matched text plus a fixed, human-written explanation. No model is involved.

## Message rules (`scam_rules.py`)

| Code | Severity | Catches | Example trigger |
|---|---|---|---|
| `GUARANTered_RETURN`→`GUARANTEED_RETURN` | high | Fixed-return promises (English + Tamil उत्तरவாதம்) | "guaranteed 40% monthly return" |
| `UNUSUALLY_HIGH_RETURN` | high | Large % figures tied to return/profit cadence | "40% monthly" |
| `URGENCY_PRESSURE` | high | Act-now pressure, deadlines (EN + TA) | "invest today", "act now", "இன்று மட்டும்" |
| `LIMITED_SLOTS_SECRET_TIP` | medium | Scarcity / insider-tip framing | "limited slots", "secret tip" |
| `IMPERSONATION` | high | Claims a regulator/bank "approved/verified/certified" a scheme or platform | "SEBI approved", "RBI certified" |
| `ASKING_CREDENTIALS` | high | Requests (request-verb + credential) for OTP/UPI PIN/password/CVV, or any remote-access tool | "share the OTP", "install AnyDesk" |
| `PERSONAL_ACCOUNT_PAYMENT` | high | Payment routed to personal accounts/wallets/crypto | "send to my GPay" |
| `UNREGISTERED_ADVISOR_CLAIM` | medium | Self-declared registration that must be verified, not trusted | "I am a SEBI registered investment advisor" |
| `FAKE_APPROVAL_ARTIFACT` | medium | Certificate/licence offered as proof | "certificate attached" |
| `PROFIT_SCREENSHOT_PROOF` | low | Profit screenshots as evidence | "profit screenshot" |

Design decisions worth knowing:

1. **`ASKING_CREDENTIALS` requires a request verb** ("share/send/enter…") near the credential word. A plain mention ("your bank will never ask for your password") must NOT fire — this false-positive guard is a fixed evaluation case.
2. **Self-claimed registration is medium, not high.** A genuine SEBI-registered advisor also says "we are SEBI registered". High severity is reserved for claims that a regulator *approved a scheme/platform* — something regulators never do.
3. **Tamil phrase coverage** is layered: structured patterns plus an `EXTRA_PHRASES` pass for Tamil scam lines. Coverage is incomplete and noted as a limitation.

## URL rules (`url_rules.py`)

Static string analysis only — **the URL is never fetched, resolved, or opened** (a tripwire test fails the suite if any socket is opened). No outbound request = no SSRF surface.

| Code | Severity | Catches |
|---|---|---|
| `NO_HTTPS` | high | Plain http links |
| `URL_SHORTENER` | medium | 17 common shortener domains |
| `IP_LITERAL_HOST` | high | Bare-IP hosts (financial sites always use domains) |
| `PRIVATE_ADDRESS` | high | Private/loopback/link-local IPv4 & IPv6 literals |
| `PUNYCODE_HOST` | high | `xn--` or non-ASCII hosts (homoglyph lookalikes) |
| `BRAND_IN_SUBDOMAIN_PATH` | high | Financial brand names outside the registrable domain (`sebi.xyz.com`, `…/sebi-login`) — with a multi-label public-suffix approximation so `sebi.gov.in` is correctly treated as brand-owned |
| `EMBEDDED_CREDENTIALS` | high | `user:pass@host` tricks |
| `EXCESSIVE_SUBDOMAINS` | medium | >4 labels |
| `SUSPICIOUS_TLD` | medium | High-abuse extensions (zip, xyz, top, click…) |
| `NONSTANDARD_PORT` | medium | Odd ports / non-http(s) schemes |
| `ENTROPY_DOMAIN` | medium | Random-character throwaway domains |

## Risk-tier policy (separation of detection and decision)

`ScamAnalyzer.risk_tier` / `UrlAnalyzer.risk_tier` are the **only** places a level is assigned:

- any **high**-severity flag → `high`
- any **medium/low** flags only → `review_carefully`
- nothing → `no_obvious_red_flags`

The `no_obvious_red_flags` summary always states this "does NOT prove the message is safe". Flags are always labelled "potential warning sign" in the UI.

## Changing rules

1. Edit `backend/app/analyzers/*`.
2. Update `evaluation/synthetic_cases.json` (the FP/FN harness fails on regressions).
3. Add/adjust tests in `backend/tests/`.
4. Update this file. Every rule change ships with tests and docs, or it doesn't ship.
