# Security Design — NiveshRaksha

Companion to `THREAT_MODEL.md`. This document maps each control to its implementation.

## Implemented controls

### Input handling
- **Length caps**: Pydantic `max_length` on every free-text field (10 000 chars for content, 2 048 for URLs, 64 for session ids). Oversized input → 422 (tested).
- **URL checker is network-free by design**: it parses the string with `urllib.parse` and never opens sockets. A dedicated test (`test_no_network_call_is_made`) replaces `socket.socket` with a tripwire and fails if any connection is attempted. This eliminates SSRF, DNS rebinding, redirect chains, and drive-by content risks as a class.
- **No file uploads** are accepted in the demo; `python-multipart` is present only for future, properly validated endpoints.
- **Prompt injection**: user text is only ever matched against regex rules. There is no LLM call in the request path, so injected instructions have no interpreter. The fixed evaluation set includes an injection payload and asserts only deterministic flags fire.

### Abuse prevention
- Sliding-window rate limiter (30 req/min per client IP) on every analysis, verification, draft, education and sources route (429 with a calm message).
- CORS allowlist restricted to the frontend origins; methods limited to GET/POST/DELETE.

### Data protection
- Redaction before persistence and export (see PRIVACY.md), covered by `tests/test_privacy.py`.
- Consent-gated storage; physical (not flag-based) deletion; 72-hour retention sweeps on every write (`NIVESHRAKSHA_RETENTION_HOURS` tunable).
- Structured JSON logs where every record passes a redacting filter that strips secret-shaped and identifier-shaped values, including from exception text.

### Error handling
- Global exception handler returns a generic message; internals are logged (scrubbed) server-side only (tested for the 404 path wording).
- Verification "not found" and analysis "no obvious red flags" states are phrased to avoid false certainty (asserted by tests).

### Supply chain & secrets
- No API keys required for the demo; `.env.example` documents the optional variables.
- `pyproject.toml` pins tool config; `requirements.txt` lists runtime deps for pinned-install reproducibility.
- Containers run as non-root users; backend healthcheck via stdlib urllib; `.dockerignore` excludes data, caches, and tests.

## Recommended before any production use (not done in demo)

1. gitleaks/semgrep/trivy in CI (tools not installed in the demo environment; commands documented in the master runbook).
2. PostgreSQL with TLS + encrypted backups replacing the SQLite demo db.
3. Shared rate-limit store (Redis) for multi-worker deployments.
4. Authentication for the evidence locker (currently isolated by random session id only).
5. Real SEBI integration over an approved channel, with pinned TLS and response schema validation.
6. Dependency lock + scheduled vulnerability scanning; content security policy headers on the frontend host.

## Verification commands

```bash
cd backend && python -m pytest -q        # includes security-relevant tests
cd backend && python -m ruff check .
cd backend && python -m mypy app
# when tooling is available:
gitleaks detect --source . --redact
semgrep --config auto .
trivy fs --severity HIGH,CRITICAL .
docker compose config
```
