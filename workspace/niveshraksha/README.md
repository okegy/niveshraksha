# NiveshRaksha — Pause. Verify. Protect.

NiveshRaksha is a privacy-first investor **safety** tool built for the Sangyan Investor Resilience Hackathon. It helps Indian investors — especially first-time investors, students, senior citizens, and regional-language users — identify suspicious financial communication, verify claims through official sources, understand their rights, and take safe next steps.

> **NiveshRaksha is not investment advice.** It never recommends buying or selling, never predicts prices or returns, and never claims a person or platform is "definitely safe". A clean result is not a guarantee — it only means no known red-flag pattern matched.

![High-risk analysis result](../docs/images/analyze-high-risk.png)

*A high-risk scam message checked live: full-width risk banner, five explainable flags with exact matched text highlighted, the assistive classifier panel (clearly labelled as assistance-only), and honest "what we could not verify" — all in under a second.*

---

## What it does

| Feature | Route | Description |
|---|---|---|
| Scam Message Analyzer | `/analyze` | Deterministic red-flag rules over pasted messages (English & Tamil): guaranteed returns, urgency pressure, OTP/UPI-PIN requests, impersonation, personal-account payments, and more. Every flag shows **what was detected, why it may be risky, the exact matched text, and safe next steps**. The detected script (ta/hi/te/ml/kn/en) is reported honestly alongside coverage limits. |
| Suspicious URL Checker | `/analyze` (URL tab) | Static-only link review: missing HTTPS, URL shorteners, raw-IP hosts, punycode/lookalike domains, brand-in-subdomain deception, embedded credentials, high-abuse TLDs. The page is **never** opened or fetched (no SSRF surface by design). |
| Advisor Verification | `/verify` | Checks a SEBI registration number or name against a **clearly-labelled synthetic demo fixture** (never presented as regulator data). Every result states the source, retrieval time, match quality, and honest uncertainty. |
| Evidence Locker | `/report` | Private, redacted incident drafts with **explicit consent** before storage, 72-hour auto-expiry, on-demand deletion, and text export. Links to official reporting portals only — nothing is submitted on your behalf. |
| Education Hub | `/learn` | 7 short modules in **6 languages** (English, Tamil, Hindi, Telugu, Malayalam, Kannada) with device-local progress and an offline fallback lesson. |
| Behavioural Pause Mode | `/pause` | A 30-second checklist that breaks urgency before money moves. Connects to no brokerage account. |
| Voice dictation | `/analyze` | Browser speech-to-text in all 6 languages for users who cannot type the message — handled by the browser engine, never by us. |
| Source Transparency | `/about` + `GET /api/v1/sources/status` | Every source's name, URL, mode (mock/static), and freshness — live. |

## Safety boundaries (enforced in code and tests)

- No buy/sell/hold recommendations, price targets, or return predictions — asserted by automated tests scanning every response.
- Critical warnings come **only** from deterministic rules; no AI model makes safety decisions.
- "Not found" in verification is always phrased as *could not verify*, never *fraudulent*.
- No PII is stored without explicit consent; stored content is redacted first (PAN, Aadhaar, phones, emails, UPI IDs, card-shaped numbers) and auto-deleted after 72 hours.
- User-supplied message content is untrusted data: prompt-injection text is scored, never obeyed.
- The API never asks for passwords, OTPs, PINs, card numbers, or remote-access permission.

## Architecture

```
frontend/   Next.js 16 (TypeScript, Tailwind v4, shadcn/ui-style components, Base UI)
backend/    FastAPI + Pydantic + SQLAlchemy (SQLite demo db, PostgreSQL-ready schema)
            ├─ app/analyzers/    deterministic scam + URL rules (the safety engine)
            ├─ app/security/     redaction, rate limiting, JSON logs with PII scrubbing
            ├─ app/sources/      official-source registry + labelled demo fixtures
            ├─ app/routers/      analyze / verify / reports / education / sources
            └─ app/storage.py    privacy-minimal persistence with retention sweeps
content/    education modules (en/ ta)
evaluation/ fixed synthetic evaluation dataset (FP/FN harness runs in CI tests)
```

- `POST /api/v1/analyze/message` · `POST /api/v1/analyze/url` · `GET /api/v1/analyze/{id}`
- `POST /api/v1/verify/advisor` · `POST /api/v1/verify/entity`
- `POST /api/v1/reports/draft` · `GET/DELETE /api/v1/reports/draft/{id}` · `GET /api/v1/reports/routes`
- `GET /api/v1/education/modules?language=en|ta|hi|te|ml|kn` · `GET /api/v1/sources/status`
- `GET /health` · `GET /ready`

Full spec: `../docs/API_SPEC.openapi.json`. Architecture, threat model, and PRD live in the repository-level `docs/` folder.

## Local setup

**Backend** (Python 3.12+):

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend** (Node 20+):

```bash
cd frontend
npm install
echo 'NEXT_PUBLIC_API_BASE_URL=http://localhost:8000' > .env.local
npm run dev
```

Open http://localhost:3000. The analyze and verify flows talk to the FastAPI backend at port 8000.

## Docker setup

```bash
docker compose up --build
# frontend on http://localhost:3000, backend on http://localhost:8000
```

## Environment variables

See [.env.example](.env.example). Summary:

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | frontend | `http://localhost:8000` | Backend origin used by the browser client |
| `NIVESHRAKSHA_DB_PATH` | backend | `backend/data/niveshraksha.db` | SQLite file location (demo) |
| `NIVESHRAKSHA_DATABASE_URL` | backend | SQLite URL | Set to a PostgreSQL URL for production-style runs |
| `NIVESHRAKSHA_RETENTION_HOURS` | backend | `72` | Auto-deletion window for stored analyses/drafts |

No secrets are required for the demo — all external integrations run in mock/static mode. Never commit real `.env` files.

## Tests & quality gates

```bash
# backend
cd backend
python -m pytest -q          # 70 tests: rules, URL checks, privacy, rate limiter, API, 6-language education + script detection, evaluation FP/FN harness
ruff check .
mypy app

# frontend
cd frontend
npm run lint
npm run typecheck
npm run build
```

The evaluation harness (`backend/tests/test_evaluation.py`) runs the fixed synthetic dataset in `evaluation/synthetic_cases.json` — including a Tamil scam message, a false-positive guard, and a prompt-injection payload — and fails on any false negative or false positive.

## Data retention policy

- Analysis results: stored redacted, auto-deleted after 72 hours (`NIVESHRAKSHA_RETENTION_HOURS`), hard-deleted by retention sweeps.
- Evidence drafts: stored **only** after an explicit consent checkbox, redacted, 72-hour expiry, real deletion on request.
- If consent is not given, the draft is returned to the browser and **nothing** is persisted server-side.
- Education progress lives only in your browser's localStorage.
- Logs are JSON-structured and scrubbed through the same redaction pipeline.

## Known limitations

- Advisor verification uses a synthetic fixture; live SEBI integration is future work.
- URL checks are static only — a link with no static red flags can still be dangerous.
- Analyzer rule coverage is strongest for English and common Tamil phrasing; the four other UI languages (Hindi, Telugu, Malayalam, Kannada) have full education content but analyzer patterns remain EN/TA-heavy.
- Screenshots/images cannot be analysed yet.
- The rate limiter is in-memory and per-process; multi-worker deployments need a shared store.

## Prohibited use

Do not use NiveshRaksha to: make investment decisions, harass or accuse individuals ("fraudulent!" verdicts are never produced), mass-scan third-party content, or present its outputs as legal, financial, or regulatory advice. Do not claim SEBI/RBI affiliation — there is none.

## License & attribution

MIT — see [LICENSE](LICENSE). The [SEBI_safe_space](https://github.com/frharsh/SEBI_safe_space) repository (MIT) was studied for high-level inspiration on advisor verification; no code was copied verbatim. See [NOTICE.md](NOTICE.md) for full third-party attribution.

---

*Designed to maximize hackathon impact while remaining honest, safe, privacy-preserving, and technically demonstrable.*
