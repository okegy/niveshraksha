# Repository Audit — indicnlp_corpus

Date: 2026-10-04 · Auditor: Repository Auditor agent (v2 build)

| Field | Finding |
|---|---|
| URL | https://github.com/AI4Bharat/indicnlp_corpus |
| Commit hash | `7afab312dea591eca37abfa329999b1da3675b5b` |
| License | **NO LICENSE FILE AT ROOT (AI4Bharat resources typically carry their own per-file terms)** |
| Reuse decision | NOT USED in this build — our corpus is fully synthetic/authored. Listed as future source for Indic embeddings. |

## Recent activity
  - 7afab31 Update README
  - 9773f48 Correct documentation of BBC corpus
  - 587b1ae Update README.md
  - 74fa854 Merge pull request #4 from parmarsuraj99/patch-1
  - 7f83d27 Fixed a typo

## Contents observed
ai4bharat-indicnlp-corpus-2020.pdf, README.md, requirements.txt

## Security & safety findings
- Secret scan (No real credentials found (everything-claude-code flags are test fixtures with literal 'a1' repeats)).)
- Install/post-install scripts: NOT EXECUTED anywhere in this build; repos were read-only cloned.
- Personal/financial data: none observed in reviewed files; nothing from these repos enters NiveshRaksha at runtime.
- Buy/sell recommendation logic: none of these repos is relied on for advice paths; NiveshRaksha's advice prohibitions are enforced by its own tests.
- Network/tool permissions: repos were never granted network or agent permissions.

## Required changes for reuse
License must be confirmed before any data is downloaded.

## Verdict
NOT USED in this build — our corpus is fully synthetic/authored. Listed as future source for Indic embeddings.
