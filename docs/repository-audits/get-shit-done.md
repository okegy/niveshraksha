# Repository Audit — get-shit-done

Date: 2026-10-04 · Auditor: Repository Auditor agent (v2 build)

| Field | Finding |
|---|---|
| URL | https://github.com/gsd-build/get-shit-done |
| Commit hash | `bdcaab2c752d9a33a1a1ca9acf3a3c81fb991815` |
| License | **MIT (LICENSE file)** |
| Reuse decision | REFERENCE ONLY — spec-driven planning read; not installed or executed. |

## Recent activity
  - bdcaab2 Merge pull request #3886 from gsd-build/chore/update-discord-link
  - b125c63 chore: update Discord invite link
  - dee2434 Merge pull request #3885 from gsd-build/chore/auto-close-repo-moved
  - b467c7e chore: point auto-close message to open-gsd/gsd-core
  - 0502b8c chore: simplify auto-close message to 'repository moved'

## Contents observed
.base64scanignore, .clinerules, .coderabbit.yaml, .gitignore, .release-monitor.sh, .secretscanignore, AGENTS.md, CHANGELOG.md, CONTEXT.md, CONTRIBUTING.md, LICENSE, package-lock.json

## Security & safety findings
- Secret scan (No real credentials found (everything-claude-code flags are test fixtures with literal 'a1' repeats)).)
- Install/post-install scripts: NOT EXECUTED anywhere in this build; repos were read-only cloned.
- Personal/financial data: none observed in reviewed files; nothing from these repos enters NiveshRaksha at runtime.
- Buy/sell recommendation logic: none of these repos is relied on for advice paths; NiveshRaksha's advice prohibitions are enforced by its own tests.
- Network/tool permissions: repos were never granted network or agent permissions.

## Required changes for reuse
MIT.

## Verdict
REFERENCE ONLY — spec-driven planning read; not installed or executed.
