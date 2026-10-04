# UX Principles — NiveshRaksha

The product talks to people at the worst moment: someone just showed them "guaranteed returns" and they're one tap from sending money. Every screen serves that moment.

## 1. Calm over alarm
Risk states use steady colour + plain words ("High risk", "Review carefully"), never flashing, siren reds, or countdown pressure. The product must not become the scammer.

## 2. Evidence over verdicts
Every flag shows: what was detected → why it can be risky → the exact matched text → what it means ("potential warning sign", never "fraud detected"). The "What we know / What we could not verify" split is always rendered.

## 3. Honesty is the interface
- "No obvious red flags" always repeats: *this does not prove it's safe*.
- Verification answers always name their source and mode (demo fixture vs. official).
- Failure states say what happened and what to do — including "results expire after 72 hours; that's privacy, not a malfunction".

## 4. Next step, not dead ends
Every result ends in safe actions: pause → verify → evidence → official reporting. The tool never submits anything for the user.

## 5. Low-literacy and low-bandwidth first
- Short sentences; no finance jargon without a one-line explanation.
- Mobile-first layout; large touch targets (48 px primary buttons); works on slow connections (static pages, minimal JS beyond Next baseline).
- Offline fallback keeps the most critical lesson available without the backend.

## 6. Language as a right, not a setting Easter egg
Six languages (EN, TA, HI, TE, ML, KN) drive both UI chrome and educational content, persisted per device. Unknown languages fail explicitly rather than silently showing English.

## 7. Privacy beside every sensitive input
A privacy notice sits next to every paste field: what happens to the text, what gets redacted, what is never stored. Consent is an explicit checkbox — never pre-ticked.

## Anti-patterns we forbid (and enforce in review)
Fake testimonials or counters; fear-based motion; unexplained confidence percentages; trading-dashboard aesthetics; dark patterns; preselected consent; any copy implying SEBI affiliation.
