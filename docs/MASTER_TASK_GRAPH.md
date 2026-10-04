# Master Task Graph - NiveshRaksha

## PHASE 0: Safety and Inventory (Completed)
- [x] Read supplied repositories (`SEBI_safe_space`)
- [x] Create repository audits (`docs/repository-audits/SEBI_safe_space.md`)
- [x] Check licenses and secrets (MIT, all clear)

## PHASE 1: Product Definition (Completed)
- [x] Generate PRD (`docs/PRD.md`)
- [x] Product strategy, track mapping, judging scorecard (`docs/PRODUCT_STRATEGY.md`, `TRACK_MAPPING.md`, `JUDGING_SCORECARD.md`)
- [x] Architecture, data flow, threat model (`docs/ARCHITECTURE.md`, `DATA_FLOW.md`, `THREAT_MODEL.md`)

## PHASE 2: Architecture Setup (Completed)
- [x] Initialize Next.js frontend (`workspace/niveshraksha/frontend`)
- [x] Initialize FastAPI backend (`workspace/niveshraksha/backend`)
- [x] OpenAPI spec regenerated from the live app — 13 endpoints (`docs/API_SPEC.openapi.json`)
- [x] Database schema aligned to implementation + source_records + retention notes (`docs/DATABASE_SCHEMA.sql`)

## PHASE 3: Design & UI Foundation (Completed)
- [x] Tailwind + shadcn/ui-style component library on Base UI primitives
- [x] Design system documented (`docs/DESIGN_SYSTEM.md`, `UI_SCREEN_MAP.md`)
- [x] Landing page (`/`), analysis workflow (`/analyze`), UX docs (`UX_PRINCIPLES.md`, `USER_JOURNEYS.md`, `ACCESSIBILITY.md`)

## PHASE 4: Core Safety Engine (Completed)
- [x] PII redaction utility (PAN/Aadhaar/phone/email/UPI/card/OTP + log scrub)
- [x] Deterministic scam rules — all 9 required categories + severity tiers + review_carefully middle tier
- [x] URL checking logic — 11 static checks, network-free by design (no SSRF surface; tripwire test)
- [x] Fixed synthetic evaluation dataset + FP/FN harness (`evaluation/synthetic_cases.json`, `docs/EVALUATION_PLAN.md`)

## PHASE 5: Verification & Education (Completed)
- [x] Official-source adapter registry with labelled synthetic fixtures + honest not_found semantics
- [x] Advisor & entity verification workflow (`/verify`)
- [x] Education hub — 7 modules × 6 languages (en, ta, hi, te, ml, kn) + offline fallback (`/learn`)
- [x] Source transparency endpoints with checksummed audit trail (`/api/v1/sources/status`, `/records`)

## PHASE 6: Privacy & Security (Completed)
- [x] Consent-gated evidence locker with redaction, 72 h retention sweep, physical deletion (`/report`)
- [x] SSRF eliminated by design (URL checker never touches the network)
- [x] Sliding-window rate limiting on all routes
- [x] Structured JSON logs with redacting filter
- [x] Threat model, privacy and security docs (`docs/THREAT_MODEL.md`, `PRIVACY.md`, `SECURITY.md`)

## PHASE 7: Integration & Edge Cases (Completed)
- [x] Frontend ↔ backend via typed API client (`src/lib/api.ts`, env-configurable base URL)
- [x] Loading, error, empty, offline states on every async surface
- [x] Behavioural pause mode (`/pause`), stable result deep links (`/result/[id]`), evidence locker (`/report`), about/transparency (`/about`)
- [x] Language switcher (6 languages) + large-text & reduced-motion accessibility toggles
- [x] Hardcoded localhost references replaced by `NEXT_PUBLIC_API_BASE_URL`

## PHASE 8: Testing & Quality Assurance (Completed)
- [x] Backend: 66 pytest tests pass (rules, URLs, privacy, API, evaluation FP/FN harness)
- [x] Backend: ruff clean, mypy clean
- [x] Frontend: lint + typecheck + build all clean
- [x] No-prohibited-advice assertion enforced on every API test response
- [x] Live smoke test of all 13 endpoints + SSR checks (6-language options verified)
- [x] In-browser walkthrough of landing/analyze/result/verify/404 flows (earlier session)
- [ ] gitleaks / semgrep / trivy / docker compose — tooling unavailable in build env; commands documented (`docs/SECURITY.md`), results in `docs/TEST_REPORT.md`

## PHASE 9: Demo Preparation (Completed)
- [x] Synthetic scam + phishing demo payloads wired into UI example buttons
- [x] Demo script and pitch deck (`docs/DEMO_SCRIPT.md`, `docs/PITCH_DECK.md`)
- [x] Test report (`docs/TEST_REPORT.md`)

## Final delivery
- [x] Root files: README.md, LICENSE (MIT), NOTICE.md, CONTRIBUTING.md, .env.example, .gitignore, docker-compose.yml, backend/frontend Dockerfiles
- [x] Git repository initialized with clean, segmented commits
