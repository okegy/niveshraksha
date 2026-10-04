# Official Source Policy

## 1. Principles
NiveshRaksha relies on official, authoritative sources to verify advisors, URLs, and entities. The system must always display source provenance, freshness, and the explicit limits of what was verified.

## 2. Approved Sources
- **SEBI Registered Intermediaries**: For verifying Investment Advisors, Research Analysts, and Brokers.
- **Scam / Phishing Databases**: Trusted cybercrime or security APIs (e.g., VirusTotal, IPQualityScore) for URL scanning.

## 3. Implementation Rules
- **No Scraping**: Never overload or scrape official websites. Use official APIs or static mock fixtures (e.g., `advisors.json`) if live APIs are unavailable.
- **Graceful Degradation**: If a source is down, the system must fail safely ("Could not verify due to source unavailability") rather than defaulting to false negatives or positives.
- **Provenance Display**: Every verification claim must include:
  - Source Name
  - Source URL
  - Retrieved At (Timestamp)
  - Match Quality/Status

## 4. Prohibited Actions
- Never represent mock/synthetic data as live regulator data in a production environment (for the hackathon demo, mock data must be clearly labeled).
- Never bypass access controls or authentication mechanisms of official sources.
