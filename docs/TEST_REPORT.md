# Test Report — NiveshRaksha

Build date: 2026-10-04. All numbers reproducible with the commands shown.

## Backend

Command: `cd workspace/niveshraksha/backend && python -m pytest -q`

| Suite | Tests | Result |
|---|---|---|
| `test_analyzers.py` — 10 fixed synthetic cases + rule-category coverage | 14 | ✅ pass |
| `test_url_analyzer.py` — static URL checks + no-network tripwire | 11 | ✅ pass |
| `test_privacy.py` — PAN/Aadhaar/phone/email/UPI/card/OTP redaction + log scrub | 8 | ✅ pass |
| `test_api.py` — full API integration incl. consent, deletion, rate-limit fields, honesty copy, no-advice assertion, 6 languages, provenance | 23 | ✅ pass |
| `test_evaluation.py` — FP/FN harness over `evaluation/synthetic_cases.json` | 10 | ✅ pass (0 FP, 0 FN) |
| **Total** | **66** | **✅ all pass** |

Static gates (same directory):

| Gate | Result |
|---|---|
| `ruff check .` | ✅ clean |
| `mypy app` | ✅ clean (19 source files) |

## Frontend

Command: `cd workspace/niveshraksha/frontend`

| Gate | Result |
|---|---|
| `npm run lint` | ✅ clean |
| `npm run typecheck` | ✅ clean |
| `npm run build` (Next.js 16 / Turbopack) | ✅ 9 routes built (8 static + 1 dynamic) |

Routes: `/`, `/analyze`, `/result/[id]`, `/verify`, `/pause`, `/learn`, `/report`, `/about`, `/_not-found`.

## Live verification (servers running)

- `GET /health`, `GET /ready` → ok / ready.
- High-risk scam message → `high`, 5 explainable flags with matched spans; response persisted; `GET /api/v1/analyze/{id}` round-trips.
- Phishing URL (`http://sebi.kyc-update.xyz/verify`) → `high` via `NO_HTTPS`, `BRAND_IN_SUBDOMAIN_PATH`, `SUSPICIOUS_TLD`; response states the page was not opened.
- Advisor verification: fixture hit → `verified` + demo-fixture uncertainty note; unknown name → `not_found` + symmetric-honesty copy.
- Education API → 7 modules for each of `en, ta, hi, te, ml, kn`; unknown language → 404.
- Evidence locker: consent-less create returns redacted content with "NOT saved"; consented create redacts phone+PAN in storage; list/delete round-trip; official routes include cybercrime.gov.in and scores.sebi.gov.in.
- SSR HTML of `/` contains the 6-language select; all static chunks load (HTTP 200).
- Browser walkthrough (earlier session): landing → analyze (high-risk result) → `/result/[id]` → expiry 404 → verify (match + not-found honesty) all verified visually in the in-app browser. Language switcher verified via SSR HTML + API after the browser guest became unavailable.

## Security & container scans

| Tool | Status |
|---|---|
| gitleaks / semgrep / trivy | ⬜ Not installed in the build environment — commands documented in `SECURITY.md`; repo contains no secrets by construction (`.env.example` only, synthetic fixtures). |
| `docker compose config` | ⬜ Docker unavailable in this environment; compose file + non-root Dockerfiles + healthchecks reviewed manually. |

## No-prohibited-advice guarantee

Every API response in `test_api.py` passes `assert_no_advice`, which scans serialized output for tokens such as "you should buy/sell/hold", "we recommend buying", "price target", "expected return", "strong buy". ✅ enforced on all suites.

## Known gaps (honest list)

1. No Playwright E2E suite installed (browsers unavailable in this environment); flows verified via live API + SSR + earlier in-browser walkthrough instead.
2. No automated accessibility audit (axe/Lighthouse) yet — manual ARIA-tree inspection done.
3. Real-world FP/FN rates unmeasured; the fixed 10-case harness guards regressions, not accuracy.
4. Screenshot/image analysis (OCR) not implemented — documented limitation.
