# Contributing to NiveshRaksha

Thanks for helping improve an investor-safety tool. Because this product deals with people's money and data, contributions carry extra obligations.

## Ground rules

1. **No investment advice, ever.** Code, copy, or UI that recommends buying/selling, ranks securities, predicts prices/returns, or presents outputs as regulatory advice will be rejected. Tests in `backend/tests/test_api.py` assert this for every API response.
2. **Deterministic rules decide risk.** Do not add LLM calls into the risk-tier path. Models may only assist explanation/translation, with a deterministic fallback.
3. **Honest uncertainty is a feature.** Never upgrade "could not verify" into a verdict in either direction. Never claim regulator affiliation.
4. **Privacy-minimal defaults.** New stored fields must be justified, redacted via `app/security/redaction.py`, covered by the retention sweep, and deletable.
5. **No secrets, no real user data.** Use the synthetic fixtures in `backend/app/sources/` and `evaluation/`. Gitleaks must come back clean.

## Development flow

```bash
# backend
cd backend && python -m pytest -q && ruff check . && mypy app

# frontend
cd frontend && npm run lint && npm run typecheck && npm run build
```

Every feature PR must:
- add or update tests (including the evaluation harness if rules change),
- keep all quality gates green,
- update relevant docs (`docs/RISK_RULES.md` for rule changes),
- use small, descriptive commits.

## Reporting vulnerabilities

For the hackathon build, open a private advisory with the maintainers rather than a public issue. Do not include real personal data in reports.
