# Track Mapping — Sangyan Investor Resilience Hackathon

## Primary track: Digital Fraud and Scam Resilience

| Track need | NiveshRaksha capability |
|---|---|
| Detect scam communication | Deterministic red-flag engine — 10 message rules + 11 URL checks, fully explainable (`docs/RISK_RULES.md`) |
| Act before money moves | Safe-next-steps on every result; 30-second behavioural pause (`/pause`); golden-hour reporting links (1930 / cybercrime.gov.in) |
| Evidence for reporting | Evidence Locker: consent-gated, redacted, expiring drafts with text export and official routes |

**Demo story (60 seconds):** a realistic "guaranteed 40% return + share OTP" WhatsApp message → analyzer shows 5 explainable flags with matched text → user is routed to pause, evidence, and official reporting instead of a verdict.

## Secondary tracks

### Misinformation and Financial Content Literacy
- Education Hub: 7 modules × **6 languages** (English, Tamil, Hindi, Telugu, Malayalam, Kannada), offline fallback lesson.
- Misinformation module teaches the forward-message test: "who benefits if I believe this?"
- Honest-uncertainty UX trains the habit that "no red flags ≠ safe".

### Investor Education for Bharat
- Regional-language first: content API with explicit language negotiation, Tamil UI + four more languages; mobile-first layouts; large-text and reduced-motion modes.
- Plain-language lessons aimed at first-time investors and families helping relatives.

### Investor Awareness, Rights, and Grievance Redressal
- Rights module (SEBI SCORES, verification rights) and complaint-preparation module.
- `/report` drafts map a raw incident into what official portals ask for — without submitting anything automatically.

## Judging-criteria alignment (summary)

- **Innovation**: provenance-first design (source status + checksummed audit trail), behavioural pause, honest-uncertainty states, network-free URL checking.
- **Technical quality**: 66 backend tests incl. FP/FN harness; ruff + mypy clean; typed frontend (lint/typecheck/build clean); Docker Compose with healthchecks.
- **Impact & trust**: works even when it cannot verify (uncertainty is a feature); multilingual; privacy-minimal by construction.

Full scorecard: `JUDGING_SCORECARD.md`.
