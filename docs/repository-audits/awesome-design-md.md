# Repository Audit — awesome-design-md

Date: 2026-10-04 · Auditor: Repository Auditor agent (v2 build)

| Field | Finding |
|---|---|
| URL | https://github.com/VoltAgent/awesome-design-md |
| Commit hash | `f6961238d5cddcf8042a74a70fc400ec67181abb` |
| License | **MIT (LICENSE file)** |
| Reuse decision | REFERENCE — design-system documentation patterns informed docs/DESIGN_SYSTEM.md structure. No code copied. |

## Recent activity
  - f696123 Update README
  - 8147538 update README
  - 664b3e7 Update launchkit banner image in README
  - 7be5c64 Update AI Design Tools section in README
  - 962e08c add nintendo design

## Contents observed
.gitignore, CONTRIBUTING.md, LICENSE, README.md

## Security & safety findings
- Secret scan (No real credentials found (everything-claude-code flags are test fixtures with literal 'a1' repeats)).)
- Install/post-install scripts: NOT EXECUTED anywhere in this build; repos were read-only cloned.
- Personal/financial data: none observed in reviewed files; nothing from these repos enters NiveshRaksha at runtime.
- Buy/sell recommendation logic: none of these repos is relied on for advice paths; NiveshRaksha's advice prohibitions are enforced by its own tests.
- Network/tool permissions: repos were never granted network or agent permissions.

## Required changes for reuse
MIT.

## Verdict
REFERENCE — design-system documentation patterns informed docs/DESIGN_SYSTEM.md structure. No code copied.
