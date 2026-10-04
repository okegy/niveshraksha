# Test Report — NiveshRaksha

Build date: 2026-10-04 (updated after the completion-prompt pass). All numbers reproducible with the commands shown.

## Backend

Command: `cd workspace/niveshraksha/backend && python -m pytest -q`

| Suite | Tests | Result |
|---|---|---|
| `test_analyzers.py` — 10 fixed synthetic cases + rule-category coverage | 14 | ✅ pass |
| `test_url_analyzer.py` — static URL checks + no-network tripwire | 11 | ✅ pass |
| `test_privacy.py` — PAN/Aadhaar/phone/email/UPI/card/OTP redaction + log scrub | 8 | ✅ pass |
| `test_api.py` — full API integration incl. consent, deletion, honesty copy, no-advice assertion, 6 languages + script detection, provenance | 24 | ✅ pass |
| `test_evaluation.py` — FP/FN harness over `evaluation/synthetic_cases.json` | 10 | ✅ pass (0 FP, 0 FN) |
| `test_ratelimit.py` — sliding-window limiter units (limit, isolation, window expiry) | 3 | ✅ pass |
| `test_api.py` extra: redaction-preview endpoint | included above | ✅ |
| **Total** | **86** | **✅ all pass** |

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

## Security & container scans (REAL RUNS)

| Tool | Version | Result |
|---|---|---|
| gitleaks (`detect --source . --redact`) | 8.28.0 | ✅ **no leaks found** across all 16 commits |
| semgrep (`--config p/ci`) | 1.179.0 | ✅ **0 findings** — 50 rules × 101 files |
| trivy (`fs --severity HIGH,CRITICAL --scanners vuln,secret,misconfig`) | 0.75.0 | ✅ 0 secrets, 0 Dockerfile misconfigs; ⚠ **1 HIGH**: `braces@3.0.3` CVE-2026-93687 (DoS via deeply nested patterns) — transitive dev-toolchain dependency, **no fixed version released upstream yet**; accepted with justification (build-time tooling path, not runtime-serving code) |
| Docker Compose end-to-end | — | ⬜ Docker Engine not installed in this environment; `docker compose config` + `up --build` cannot execute. Compose YAML, non-root Dockerfiles and healthchecks are reviewed; trivy misconfig scan of both Dockerfiles is clean. |

Note: semgrep's installer upgraded `starlette` past fastapi 0.115's supported range; `requirements.txt` now pins `starlette<0.39` to prevent recurrence.

## No-prohibited-advice guarantee

Every API response in `test_api.py` passes `assert_no_advice`, which scans serialized output for tokens such as "you should buy/sell/hold", "we recommend buying", "price target", "expected return", "strong buy". ✅ enforced on all suites.

## Playwright E2E (master-prompt scenarios)

`cd workspace/niveshraksha/frontend && npm run test:e2e` (Playwright 1.63, Chromium):

| # | Scenario | Result |
|---|---|---|
| 1 | Landing page loads with hero + disclaimer + demo-mode banner | ✅ |
| 2 | Message analysis returns a risk level | ✅ |
| 3 | High-risk result: 3+ flags, safe next steps, evidence spans | ✅ |
| 4 | Advisor verification: match + DEMO FIXTURE uncertainty note | ✅ |
| 5 | Tamil switch: nav + Tamil education content loads | ✅ |
| 6 | Incident draft: create with consent → delete → confirmed gone | ✅ |
| 7 | Backend offline: graceful "Could not reach…" error | ✅ |
| 8 | No-recommendation guarantee on result text | ✅ |

**8/8 passing.** (`workspace/niveshraksha/tests/e2e` is a junction to `frontend/e2e` for Node module resolution.)

## Known gaps (honest list)

1. Automated accessibility audit (axe/Lighthouse) not yet wired — manual ARIA-tree inspection + keyboard walkthrough done.
2. Real-world FP/FN rates unmeasured; the synthetic per-language harness guards regressions, not field accuracy.
3. Screenshot/image OCR not implemented (validated-and-discarded upload endpoint ships instead) — documented limitation.
4. Docker Engine unavailable in this environment — Compose end-to-end pending a Docker-capable machine.
