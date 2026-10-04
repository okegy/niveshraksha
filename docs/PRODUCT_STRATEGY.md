# Product Strategy — NiveshRaksha

## Problem statement

India's first-time investors meet scams through WhatsApp forwards, Telegram "tips", fake advisor profiles, and lookalike links — usually on a phone, often in a regional language, usually at the exact moment of urgency ("last 2 slots, share OTP"). Regulator resources exist but are hard to find, in English-heavy jargon, and arrive *after* doubt has already been replaced by excitement.

**NiveshRaksha's wedge:** put a calm, explainable check *inside that moment* — before money moves — and route the user to official sources and reporting instead of giving advice or verdicts.

## Product narrative

> "Pause. Verify. Protect."
> When a suspicious message arrives, NiveshRaksha helps you (1) pause and see the warning signs in plain words, (2) verify claims against official sources with honest uncertainty, and (3) protect your family by preparing evidence and knowing where to report. It never tells you what to invest in — it helps you avoid being cheated.

## Feature → value mapping

| Feature | User value | Track value |
|---|---|---|
| Message analyzer (deterministic, explainable) | "Why is this risky?" answered in their language, with proof | Fraud resilience |
| URL checker (static, network-free) | Safe link inspection without opening the trap | Fraud resilience |
| Advisor verification + honest uncertainty | A 30-second registry check that never overclaims | Awareness & rights |
| Behavioural pause | Breaks urgency, the scammer's main weapon | Fraud resilience |
| Evidence Locker (consent, redaction, expiry) | Turns panic into a reportable record | Grievance redressal |
| Education hub ×6 languages + offline | Prevention before the first scam message | Education for Bharat |
| Source transparency (/about, /sources/status) | Trust through provenance, not branding | All tracks |

## Target users (priority order)

1. First-time retail investors (18–35) receiving tips on WhatsApp/Telegram.
2. Families helping older relatives evaluate "advisors".
3. Senior citizens navigating UPI/OTP pressure.
4. Regional-language users (TA/HI/TE/ML/KN first-class).
5. Volunteers/educators running awareness sessions.

## Differentiators

1. **Explainability by construction** — every flag is a named rule with matched text; nothing is a black-box score.
2. **Honest uncertainty as UX** — "not found", "could not verify", and "no red flags" are first-class, repeated states, not footnotes.
3. **Provenance-first verification** — source, mode, freshness, and checksummed audit trail for every claim source.
4. **Privacy as default** — consent-gated, redacted, expiring storage; no accounts.
5. **Network-free URL checking** — SSRF-proof by design, no API keys needed, works in the demo offline.

## What we deliberately do not do

No investment advice, no price/return predictions, no security rankings, no legitimacy verdicts, no auto-submitted complaints, no SEBI affiliation claims, no LLM in the safety decision path.

## Success measures for the hackathon demo

- Judge understands the value in ≤30 s (landing + one analyze run).
- Zero prohibited-advice outputs across the demo (test-enforced).
- Full flow works offline of any external API (synthetic fixtures only).
- Every risk answer answers: what was detected, why it matters, what couldn't be verified, what to do next.

## Post-hackathon roadmap (honest)

1. Live SEBI intermediaries integration via an approved channel (replacing fixtures behind the same adapter).
2. OCR for screenshot analysis; more scam-phrase coverage per language.
3. Community-reviewed rule packs with versioned evaluation sets.
4. Feature-phone-friendly channel (SMS/IVR checker) for the deepest-reach audience.
