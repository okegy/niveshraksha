# Repository Audit — graphify

Date: 2026-10-04 · Auditor: Repository Auditor agent (v2 build)

| Field | Finding |
|---|---|
| URL | https://github.com/Graphify-Labs/graphify |
| Commit hash | `48d7c0e832cd2d67d86850e716ddea16df6238ea` |
| License | **Apache-2.0 (LICENSE file)** |
| Reuse decision | SKILL — cloned to .agents/skills audit flow; not executed in this environment. |

## Recent activity
  - 48d7c0e release: 0.9.75
  - 97608ef Add regression tests for the symbolless file warning
  - f81c4e5 Warn when a cleanly parsed code file yields no symbols
  - e8b5d27 fix(extract): keep shrink accounting out of graph.json
  - daee93f fix(extract): refuse a dedup shrink unless the user accepts it

## Contents observed
.dockerignore, .gitattributes, .gitignore, .pre-commit-config.yaml, AGENTS.md, ARCHITECTURE.md, BENCHMARKS.md, CHANGELOG.md, CODE_OF_CONDUCT.md, CONTRIBUTING.md, Dockerfile, LICENSE

## Security & safety findings
- Secret scan (No real credentials found (everything-claude-code flags are test fixtures with literal 'a1' repeats)).)
- Install/post-install scripts: NOT EXECUTED anywhere in this build; repos were read-only cloned.
- Personal/financial data: none observed in reviewed files; nothing from these repos enters NiveshRaksha at runtime.
- Buy/sell recommendation logic: none of these repos is relied on for advice paths; NiveshRaksha's advice prohibitions are enforced by its own tests.
- Network/tool permissions: repos were never granted network or agent permissions.

## Required changes for reuse
Apache-2.0; no install was run (see SKILL_AUDIT).

## Verdict
SKILL — cloned to .agents/skills audit flow; not executed in this environment.
