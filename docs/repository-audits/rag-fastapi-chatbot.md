# Repository Audit — rag-fastapi-chatbot

Date: 2026-10-04 · Auditor: Repository Auditor agent (v2 build)

| Field | Finding |
|---|---|
| URL | https://github.com/haontuhcmut/rag-fastapi-chatbot |
| Commit hash | `729055cb90b43d0199ca162878b0ff49cf696a5a` |
| License | **MIT (LICENSE file)** |
| Reuse decision | CONCEPTS ONLY — ingestion/chunking/embedding flow informed our knowledge-corpus design. Our retriever is an original TF-IDF implementation (no external vector DB needed for the demo). |

## Recent activity
  - 729055c fix sign up error not match password-confirm
  - 0c6ae40 change prompt template
  - b6067c8 API testing succeeded
  - a7ffbf2 error db container role username not exist
  - 52ef3a4 handling openapi

## Contents observed
.dockerignore, .env.example, .gitignore, alembic.ini, docker-compose.yml, Dockerfile, entrypoint.sh, LICENSE, nginx.conf, README.md, requirements.txt

## Security & safety findings
- Secret scan (No real credentials found (everything-claude-code flags are test fixtures with literal 'a1' repeats)).)
- Install/post-install scripts: NOT EXECUTED anywhere in this build; repos were read-only cloned.
- Personal/financial data: none observed in reviewed files; nothing from these repos enters NiveshRaksha at runtime.
- Buy/sell recommendation logic: none of these repos is relied on for advice paths; NiveshRaksha's advice prohibitions are enforced by its own tests.
- Network/tool permissions: repos were never granted network or agent permissions.

## Required changes for reuse
MIT compatible; attribution in NOTICE.md.

## Verdict
CONCEPTS ONLY — ingestion/chunking/embedding flow informed our knowledge-corpus design. Our retriever is an original TF-IDF implementation (no external vector DB needed for the demo).
