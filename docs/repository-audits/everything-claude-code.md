# Repository Audit — everything-claude-code

Date: 2026-10-04 · Auditor: Repository Auditor agent (v2 build)

| Field | Finding |
|---|---|
| URL | https://github.com/affaan-m/everything-claude-code |
| Commit hash | `ef648e01899ba3e8dc6371642deaaf64b4477775` |
| License | **MIT (LICENSE file)** |
| Reuse decision | REFERENCE ONLY — workflow/hook practices read. Contains synthetic test-fixture strings resembling API keys ('A1' repeated) — verified NOT real credentials. |

## Recent activity
  - ef648e0 docs(ja-JP): match current sponsors (CodeRabbit, Greptile, Moonshot AI, Itô, SerpApi) (#3363)
  - c05b2d6 chore: retire the Everything Claude Code name, ECC only (#3330)
  - 0348d7b chore(release): 2.2.3, ECC-only naming in pi/core and a longer npm publish wait (#3329)
  - c70874f feat(pi): curated pi/core skills+prompts profile, CI load test, and 2.2.2 release sync (#3264)
  - d30588f Merge pull request #3251 from affaan-m/affaan/integrate-reviewed-followups-20260928

## Contents observed
.coderabbit.yaml, .env.example, .gitattributes, .gitignore, .gitleaksignore, .markdownlint.json, .mcp.json, .npmignore, .prettierrc, .tool-versions, .yarnrc.yml, agent.yaml

## Security & safety findings
- Secret scan (No real credentials found (everything-claude-code flags are test fixtures with literal 'a1' repeats)).)
- Install/post-install scripts: NOT EXECUTED anywhere in this build; repos were read-only cloned.
- Personal/financial data: none observed in reviewed files; nothing from these repos enters NiveshRaksha at runtime.
- Buy/sell recommendation logic: none of these repos is relied on for advice paths; NiveshRaksha's advice prohibitions are enforced by its own tests.
- Network/tool permissions: repos were never granted network or agent permissions.

## Required changes for reuse
MIT.

## Verdict
REFERENCE ONLY — workflow/hook practices read. Contains synthetic test-fixture strings resembling API keys ('A1' repeated) — verified NOT real credentials.
