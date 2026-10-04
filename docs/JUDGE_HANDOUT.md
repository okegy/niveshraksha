# Judge Handout — NiveshRaksha (one page)

**Pause. Verify. Protect.**

## The 30-second version
A suspicious "SEBI-approved, guaranteed 40% return" message arrives. NiveshRaksha checks it with deterministic, explainable rules in milliseconds, flags five red flags with the exact matching text, auto-detects the language, and hands the user safe next steps — pause checklist, advisor verification, redacted evidence draft, official complaint channels. It never gives investment advice and never claims certainty.

## What to try (2 minutes, no internet needed beyond localhost)
1. `/analyze` → "Load example (synthetic)" → Analyze. Watch: high-risk banner, 5 flags with evidence, model-assist panel (assistance only), what could NOT be verified.
2. Switch the language selector to any of **12 languages** — the whole UI, education content, and detection coverage follow.
3. `/chat` → ask "How do I verify an investment advisor?" → cited answer from official sources. Then ask "Which stock gives the highest return?" → **refused, with redirection**.
4. `/verify` → registration number `INA000000001` → match found, but the page states in bold it is demo-fixture data. Try a fake name → honest "could not verify" (not "fraudulent!").
5. `/report` → paste text with a phone number and PAN → consent off = nothing stored; consent on = redacted draft with 72-hour expiry and one-tap deletion.
6. `/about` → live source status with checksummed audit trail.

## Architecture in one line
Next.js 16 (12-language UI, voice dictation, glass UI) ↔ FastAPI (deterministic rules → assistive ML metadata → cited RAG guide → privacy layer) ↔ SQLite/Postgres-ready schema with consent-gated, expiring storage.

## The rules we never break
No buy/sell/hold advice. No price or return predictions. No legitimacy verdicts — "not found" is never "fraudulent". No regulator affiliation. No LLM in the safety decision path. No storage without consent; 72-hour hard expiry; redaction before anything touches disk. Prompt-injection text is data, never instructions.

## Numbers
- 85 backend tests (incl. per-language F1 evaluation harness, privacy, no-advice assertions) — all passing
- 12 languages end-to-end; Urdu honestly withheld pending validation
- 0 storage without consent; 72 h retention; 0 unredacted PII fields persisted
- ruff + mypy + ESLint + TypeScript clean; Docker Compose + non-root containers + healthchecks

## Honest limits
Synthetic advisor fixture (live SEBI integration is the roadmap's first item). No real-world accuracy dataset yet — synthetic evaluation gates regressions, not field performance. OCR for screenshots not enabled. gitleaks/semgrep/trivy commands documented but not run in this environment.

## Track fit
Digital Fraud & Scam Resilience (primary) · Misinformation & Financial Content Literacy · Investor Education for Bharat · Awareness, Rights & Grievance Redressal · Behavioural & Financial Resilience.

*NiveshRaksha is a hackathon safety tool. It is not a broker, adviser, regulator, or lawyer.*
