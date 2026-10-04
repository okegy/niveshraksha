# Judging Scorecard — self-assessment against likely criteria

Honest self-scores (1–5) with the evidence a judge can check in under a minute.

| Criterion | Score | Evidence |
|---|---|---|
| Problem clarity | 4 | Realistic synthetic scam demoed end-to-end in 60 s; problem statement echoed in PRD (`docs/PRD.md`). |
| Innovation / uniqueness | 4 | Provenance-first verification (source status + checksum audit trail), honest-uncertainty UX, network-free URL checker, behavioural pause — combined rather than any single trick. |
| Technical execution | 4 | 66 backend tests (incl. FP/FN evaluation harness), ruff + mypy clean, typed Next.js frontend with lint/typecheck/build green, Docker Compose + healthchecks, non-root containers. |
| Safety & ethics | 5 | No-advice guarantee asserted by tests; "not found ≠ fraud" enforced in copy; no regulator logos/affiliation; prompt-injection case in fixed eval set; synthetic data only. |
| Privacy | 4 | Consent-gated storage, redaction-before-persistence (tested), 72 h retention sweep, scrubbed logs, real deletion. Loses a point: no formal DPDP review. |
| UX / accessibility | 3 | Mobile-first, calm palette, progressive disclosure, ARIA labels, keyboard-operable, large-text + reduced-motion toggles, 6 languages. Loses points: no automated axe/Lighthouse run yet, no screen-reader session recorded. |
| Multilingual reach | 4 | 6 languages end-to-end (UI chrome + 7 education modules each) with offline fallback. Loses a point: analyzer regex coverage beyond EN/TA is thin. |
| Reproducibility | 4 | `.env.example`, Docker Compose, seeded synthetic fixtures, one-command local run; demo needs no API keys. |
| Demo readiness | 4 | `docs/DEMO_SCRIPT.md` + `docs/PITCH_DECK.md`; every demo path tested live. Loses a point: screenshots/GIF not yet baked into the README. |
| Scalability story | 3 | Postgres-ready schema, adapter pattern for real sources; honest about in-memory limiter and single-process scope. |

**Weakest links we acknowledge:** no live regulator integration (demo fixtures), no automated accessibility audit, no real-world accuracy measurement. All are documented rather than hidden.
