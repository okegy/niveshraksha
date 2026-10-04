# Repository Audit — NLP-Cyber-Harm-Detection

Date: 2026-10-04 · Auditor: Repository Auditor agent (v2 build)

| Field | Finding |
|---|---|
| URL | https://github.com/RockENZO/NLP-Cyber-Harm-Detection |
| Commit hash | `d56cbad63ef1e58789b4f279790a690472057f3f` |
| License | **NONE FOUND** |
| Reuse decision | INSPIRATION ONLY — evaluation-directory layout noted; no code reused. |

## Recent activity
  - d56cbad Merge pull request #2 from RockENZO/codex/reproducibility-20260930
  - 00bd990 Verify frozen split identities and model hashes before evaluation
  - 397e103 Improve nine-class held-out performance with word-character SVM and validation-selected operating point
  - 8ef8184 Add source-held-out baseline and fixed-label evaluation evidence
  - a2e90c6 Merge pull request #1 from RockENZO/codex/reproducible-evaluation-docs

## Contents observed
.gitattributes, .gitignore, final_fraud_detection_dataset.csv, README.md, requirements.txt

## Security & safety findings
- Secret scan (No real credentials found (everything-claude-code flags are test fixtures with literal 'a1' repeats)).)
- Install/post-install scripts: NOT EXECUTED anywhere in this build; repos were read-only cloned.
- Personal/financial data: none observed in reviewed files; nothing from these repos enters NiveshRaksha at runtime.
- Buy/sell recommendation logic: none of these repos is relied on for advice paths; NiveshRaksha's advice prohibitions are enforced by its own tests.
- Network/tool permissions: repos were never granted network or agent permissions.

## Required changes for reuse
Unlicensed.

## Verdict
INSPIRATION ONLY — evaluation-directory layout noted; no code reused.
