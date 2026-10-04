# SKILL AUDIT — graphify

Date: 2026-10-04

| Field | Finding |
|---|---|
| Source URL | https://github.com/Graphify-Labs/graphify |
| Commit reviewed | 48d7c0e8 |
| License | Apache-2.0 |
| Installed files | NONE — the skill was audited read-only; no installer was executed in this environment |
| Permissions requested | None granted. No agent registration was performed. |
| Network access | None granted. |
| Security findings | No real secrets in reviewed files. everything-claude-code contains synthetic `sk-` test fixtures ('A1' repeated) — verified not credentials. |
| Safe usage | Treat as reference material only. If installed later: re-run gitleaks on the pinned commit, review install scripts manually, and register only after that review. |

## Purpose in this project
Codebase/docs/schema project mapping for agents.

## Status
AUDITED, NOT INSTALLED — reference-only use in this build.
