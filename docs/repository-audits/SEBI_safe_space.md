# Repository Audit: SEBI_safe_space

## 1. Repository Details
**Source:** https://github.com/frharsh/SEBI_safe_space
**Commit Hash:** 21f0ee2b51a9e1b9182c9b28721df2cec9d59e43

## 2. License Compatibility
**License:** MIT License
**Status:** Compatible. We can selectively reuse its patterns, but must preserve required attribution in a `NOTICE.md` file. The original code should not be presented as the resulting NiveshRaksha product.

## 3. Commit History Overview
Recent commits:
- `21f0ee2` Update README.md
- `e34d8f3` Add files via upload
- `6f1cb99` Update README.md
- `24b6dec` Initial commit

## 4. Exposed Credentials
**Finding:** No hardcoded real API keys or credentials were found in the codebase.
**Details:** The `README.md` contains environment variable references for API keys (`VIRUSTOTAL_API_KEY`, `IPQUALITYSCORE_API_KEY`, `SCAMSEARCH_API_KEY`), but they are securely placed behind a `.env` requirement for the user.

## 5. Data Handling
**Storage:** The repository utilizes JSON files (`advisors.json`) for its database and handles structured fraud report data. 
**Privacy/Security:** It works with mock data when real API keys are missing. Any real or personal information found should be isolated and replaced with synthetic data during development.

## 6. Prohibited Investment Advice
**Finding:** The platform is designed specifically for fraud detection and investor protection. It does not provide direct investment advice. Instead, it offers tools for advisor verification and URL scanning. 

## 7. Source Verification
**Status:** Implements verification of advisors against the official SEBI database using `advisors.json` lookups.

## 8. Front-end / Mockup Status
**Tech Stack:** HTML5, CSS3, JavaScript (Vanilla).
**Implementation:** Implements a responsive web design and relies on a Python Flask backend for integrations. Front-end code should be selectively rewritten if integrated into NiveshRaksha to match the final product's style and architecture requirements.
