# Repository Audit — ai_scam_detector

Date: 2026-10-04 · Auditor: Repository Auditor agent (v2 build)

| Field | Finding |
|---|---|
| URL | https://github.com/kassse1/ai_scam_detector |
| Commit hash | `13052cbc8868e16265849cf3c3dd1a1695509d80` |
| License | **MIT (LICENSE file)** |
| Reuse decision | CONCEPTS ONLY — hybrid rules+ML architecture, feedback/evaluation ideas. No code copied; our engine and ML adapter are original implementations. |

## Recent activity
  - 13052cb Simplify system architecture diagram in README
  - 847e134 Add MIT License to the project
  - 965e046 Merge pull request #1 from kassse1/test
  - 4145d6b Update README.md
  - fa2dc75 Add hybrid scoring and improved explainability UI

## Contents observed
.gitignore, LICENSE, README.md, req.txt

## Security & safety findings
- Secret scan (No real credentials found (everything-claude-code flags are test fixtures with literal 'a1' repeats)).)
- Install/post-install scripts: NOT EXECUTED anywhere in this build; repos were read-only cloned.
- Personal/financial data: none observed in reviewed files; nothing from these repos enters NiveshRaksha at runtime.
- Buy/sell recommendation logic: none of these repos is relied on for advice paths; NiveshRaksha's advice prohibitions are enforced by its own tests.
- Network/tool permissions: repos were never granted network or agent permissions.

## Required changes for reuse
MIT compatible with attribution in NOTICE.md.

## Verdict
CONCEPTS ONLY — hybrid rules+ML architecture, feedback/evaluation ideas. No code copied; our engine and ML adapter are original implementations.
