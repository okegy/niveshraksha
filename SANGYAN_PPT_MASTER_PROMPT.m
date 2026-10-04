# MASTER PROMPT: SANGYAN HACKATHON PRESENTATION GENERATOR
# File: SANGYAN_PPT_MASTER_PROMPT.m
# Purpose: Analyze the project workspace and generate a generic, editable PPT while preserving the existing cover-slide design.

You are a Presentation Architect, Information Designer, UI/UX Designer, Technical Writer, and Hackathon Pitch Coach.

Your task is to inspect the complete project workspace, source repositories, documentation, generated artifacts, screenshots, diagrams, images, code, and available presentation files, then create a polished, generic, editable presentation template for the SANGYAN Investor Resilience Hackathon.

The presentation must explain the product workflow, technology stack, system architecture, AI/ML pipeline, multilingual support, safety design, privacy approach, evaluation strategy, and demo journey without inventing facts.

The presentation must be generic enough for the user to replace placeholders with their own final content.

==================================================
1. PRIMARY OBJECTIVE
==================================================

Create a presentation that:

- Analyzes the supplied project files and implementation.
- Understands the actual working flow before creating slides.
- Uses only facts supported by the files or clearly labels placeholders.
- Preserves the existing front-page/cover-slide design exactly as a visual reference.
- Does not disturb, overwrite, crop, recolor, or remove existing images.
- Keeps all existing images available and unchanged unless the user explicitly asks for edits.
- Produces a generic editable deck with placeholders for the user’s final wording.
- Gives design references and layout guidance for every slide.
- Uses a consistent visual language across the complete deck.

Do not fabricate:
- Accuracy values.
- User counts.
- Funding or adoption numbers.
- Partnerships.
- Government or regulator affiliation.
- Model capabilities.
- API integrations.
- Successful deployments.
- Official verification results.

If information is unavailable, use:
- `[PLACEHOLDER: add verified metric]`
- `[PLACEHOLDER: insert screenshot]`
- `[PLACEHOLDER: confirm source]`
- `[TO VERIFY]`

==================================================
2. INPUT ANALYSIS
==================================================

First inspect all available project files without modifying them.

Potential inputs:
- Existing PPT or PPTX files.
- PDF problem statements.
- README files.
- PRD and architecture documents.
- API specifications.
- Database schema.
- Source code.
- Screenshots and images.
- UI mockups.
- Repository audit reports.
- Model cards and evaluation files.
- Demo videos or video stills.
- Design-system files.
- `.agents/skills/` instructions.
- `MASTER_PROMPT.m` and `MASTER_PROMPT_MULTILINGUAL.m`.

Create an inventory before slide generation:

```text
File inventory:
- File path
- File type
- Purpose
- Relevant slides
- Visual assets available
- Source of truth status
- Sensitive data status
- Whether it may be modified
```

Treat files as follows:

- Source code: inspect for actual functionality.
- README: use for declared functionality but verify against code.
- Screenshots: preserve visually and do not infer unsupported backend behaviour.
- PDFs: extract text and identify requirements.
- Existing presentations: preserve the cover-slide design and inspect layout patterns.
- Images: do not alter them unless explicitly authorised.
- Secrets and personal data: do not place them in the deck.

If source files conflict, report the conflict and prefer tested implementation or clearly label the conflict.

==================================================
3. COVER SLIDE PRESERVATION
==================================================

The first slide is protected.

If an existing PPT/PPTX is supplied:

1. Duplicate the original presentation.
2. Preserve the first slide as a master visual reference.
3. Do not alter its:
   - Background.
   - Logo placement.
   - Images.
   - Typography.
   - Colours.
   - Borders.
   - Shapes.
   - Spacing.
   - Aspect ratio.
   - Decorative elements.
4. Keep editable text placeholders only if they already exist.
5. If the first slide is not editable, recreate its visual style on a separate editable cover template without changing the source file.
6. Add a note in the design specification explaining what was preserved.

The cover slide should contain generic placeholders such as:

- `[PROJECT NAME]`
- `[TEAM NAME]`
- `[TEAM MEMBERS]`
- `[COLLEGE / ORGANISATION]`
- `[TRACK NAME]`
- `[DATE]`

Do not force a new visual style onto the cover slide. Derive the rest of the presentation’s design system from it.

If no presentation exists, create a cover inspired by the supplied project visuals, not by an unrelated brand.

==================================================
4. DESIGN SYSTEM EXTRACTION
==================================================

Analyze the cover and available assets to derive:

- Primary and secondary colours.
- Background and surface colours.
- Font families or nearest available alternatives.
- Heading hierarchy.
- Body-text sizes.
- Border radius.
- Shadow style.
- Grid and margins.
- Image treatment.
- Icon style.
- Diagram style.
- Button and callout style.
- Use of gradients.
- Use of transparency or glassmorphism.
- Motion suggestions for an optional digital version.

Generate:

```text
DESIGN_SYSTEM.md
```

Include:

- Colour tokens.
- Typography tokens.
- Spacing tokens.
- Component rules.
- Slide-layout rules.
- Do/don’t examples.
- Accessibility guidance.
- Source image handling rules.

If the existing cover uses glassmorphism, use restrained glassmorphism for internal slides:

- Frosted panels.
- High-contrast text.
- Soft border.
- Limited blur.
- Subtle shadow.
- Solid fallback where transparency reduces readability.

Do not use glass effects behind dense text.

==================================================
5. PRESENTATION FORMAT
==================================================

Default format:
- 16:9 widescreen.
- Editable PPTX.
- Optional PDF preview.
- High-resolution exported slides.
- Fonts that are legally available and embedded or safely substituted.

Use the existing deck’s dimensions if they differ from 16:9.

Create:

```text
SANGYAN_NiveshRaksha_Generic_Template.pptx
SANGYAN_NiveshRaksha_Generic_Template.pdf
DESIGN_SYSTEM.md
SLIDE_CONTENT_MAP.md
ASSET_INVENTORY.md
PRESENTATION_SOURCES.md
```

If the environment cannot create a PPTX, generate an editable slide specification and a PDF only. Do not claim that a PPTX was created if it was not.

==================================================
6. GENERIC SLIDE STRUCTURE
==================================================

Create the following slide sequence. Keep the text concise and editable.

Slide 1 — Protected Cover

Preserve the original cover-slide design.
Use placeholders:
- `[PROJECT NAME]`
- `[TEAM NAME]`
- `[ONE-LINE VALUE PROPOSITION]`
- `[TRACK]`

Slide 2 — Problem Context

Title:
`The investor-safety problem`

Content placeholders:
- `[Who is affected?]`
- `[What scam or misinformation pattern exists?]`
- `[Why existing responses are insufficient?]`
- `[One verified source or statistic]`

Visual:
- Use a simple journey or problem illustration.
- Do not use fabricated statistics.

Slide 3 — Target Users

Show 3–5 personas:
- `[First-time investor]`
- `[Regional-language user]`
- `[Senior citizen or family member]`
- `[Awareness volunteer]`

For every persona include:
- Need.
- Risk.
- Desired outcome.

Slide 4 — Solution Overview

Title:
`From suspicious message to safer action`

Show the high-level workflow:

```text
Message / URL / Screenshot
        ↓
Privacy redaction
        ↓
Language detection
        ↓
Risk rules + AI assistance
        ↓
Official-source verification
        ↓
Explainable result
        ↓
Safe next steps and education
```

Slide 5 — Product Experience

Show the main product modules:
- Scam message analysis.
- Suspicious URL checking.
- Advisor/entity verification.
- Evidence draft.
- Multilingual education.
- Raksha Guide chatbot.
- Behavioural pause checklist.

Use editable module cards.

Slide 6 — User Journey

Show one complete journey:

```text
User receives suspicious message
→ Opens NiveshRaksha
→ Selects language
→ Pastes message
→ Sensitive values are redacted
→ Warning signs are highlighted
→ Official sources are displayed
→ User gets safe next steps
→ User creates an optional redacted report
```

Slide 7 — AI/ML Pipeline

Show:

```text
Input validation
→ Language identification
→ Script/transliteration normalisation
→ Privacy redaction
→ Deterministic red-flag rules
→ Multilingual classifier
→ URL/entity checks
→ Evidence retrieval
→ Explanation generation
→ Human-readable multilingual output
```

Include a callout:
`AI assists classification and explanation; it does not provide investment advice.`

Slide 8 — Multilingual Capability

Include editable language chips:
- English.
- Hindi.
- Tamil.
- Telugu.
- Kannada.
- Malayalam.
- Bengali.
- Marathi.
- Gujarati.
- Odia.
- Punjabi.
- Assamese.
- `[Additional validated language]`.

Show:
- Script detection.
- Code-mixed input.
- Translation or response language selection.
- Per-language evaluation.

Do not claim production-quality support without evaluation evidence.

Slide 9 — Explainable Detection

Show example red flags:
- Guaranteed-return promise.
- Urgency or limited-slot pressure.
- Fake regulator identity.
- OTP, UPI PIN, or password request.
- Suspicious link.
- Personal-account payment request.
- Fake KYC or account-freeze threat.

Show the result format:

```text
What we detected
Why it matters
What we verified
What we could not verify
What to do next
```

Slide 10 — Raksha Guide Chatbot

Explain:
- Retrieval-augmented answers.
- Official and curated knowledge sources.
- Citations and freshness.
- Multilingual interaction.
- Refusal of buy/sell requests.
- Safe fallback when evidence is missing.

Visual:
- Use the shield avatar if supplied.
- Do not modify the original avatar image.
- Add a placeholder if the asset is missing.

Slide 11 — System Architecture

Use editable layers:

```text
Client layer
  Next.js / TypeScript / Tailwind / shadcn

API layer
  FastAPI / validation / rate limits

Safety layer
  redaction / rules / URL protection / input validation

AI/ML layer
  multilingual classifier / embeddings / RAG

Data layer
  PostgreSQL / vector store / short-lived sessions

Source layer
  official sources / source metadata / freshness

Operations layer
  Docker / tests / monitoring / security scans
```

Slide 12 — Technology Stack

Use categories:

Frontend:
- Next.js.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- TanStack Query.
- Framer Motion.
- i18next or next-intl.

Backend:
- FastAPI.
- Pydantic.
- SQLAlchemy or SQLModel.
- PostgreSQL.
- Optional Redis.

AI/ML:
- PyTorch.
- Hugging Face Transformers.
- IndicBERT-compatible model.
- Sentence Transformers.
- ChromaDB, Qdrant, or pgvector.

Engineering:
- Docker.
- Pytest.
- Vitest.
- Playwright.
- Gitleaks.
- Semgrep.
- Trivy.

Replace items with actual verified project dependencies.

Slide 13 — Data and Privacy

Show:
- Redaction before logs and model calls.
- No passwords, OTPs, or UPI PINs.
- Minimal data retention.
- Consent before saving evidence.
- Delete and export controls.
- Synthetic evaluation data.
- No training on private user messages.

Use a data-flow diagram:

```text
User input
→ redaction
→ analysis
→ temporary result
→ optional redacted draft
→ automatic expiry/deletion
```

Slide 14 — Security and Threat Model

Cover:
- SSRF protection.
- Private-IP blocking.
- Redirect limits.
- Safe upload validation.
- Prompt-injection resistance.
- Secret scanning.
- Dependency scanning.
- Rate limiting.
- Source verification.
- Secure error handling.

Use a threat-to-control table.

Slide 15 — UI/UX Design Language

Show the extracted design system:
- Colour palette.
- Typography.
- Glass cards.
- Risk badges.
- Evidence timeline.
- Source-citation chips.
- Chat avatar.
- Language selector.
- Accessible focus states.

Include motion guidance:
- 150–220ms tab and button transitions.
- Reduced-motion support.
- No flashing alerts.
- Optional desktop cursor effect only.

Slide 16 — Repository and Agent Workflow

Explain the audited development workflow:

```text
Source repositories
→ license and security audit
→ selective reuse decision
→ architecture planning
→ UI/UX implementation
→ backend and AI/ML integration
→ tests and scans
→ demo-ready commit
```

List only repositories actually used or mark others as `[planned]`.

Slide 17 — Evaluation

Show metrics placeholders:
- `[Precision by language]`
- `[Recall by language]`
- `[F1 score by language]`
- `[False-positive rate]`
- `[Latency]`
- `[Citation coverage]`
- `[Accessibility result]`
- `[Security scan status]`

Add a note:
`All metrics must come from reproducible evaluation, not model-card claims alone.`

Slide 18 — Demo Scenario

Use a synthetic example:

`[Synthetic scam message in selected language]`

Demo sequence:
1. Select language.
2. Paste message.
3. Redaction preview.
4. Highlighted warning signs.
5. Explanation and sources.
6. Raksha Guide response.
7. Pause checklist.
8. Redacted report draft.

Do not use real personal or financial data.

Slide 19 — Impact and Scalability

Use placeholders:
- `[Target user group]`
- `[Expected safety outcome]`
- `[Languages and regions]`
- `[Low-bandwidth strategy]`
- `[Future deployment partners, if verified]`
- `[Scalability plan]`

Do not imply partnerships without evidence.

Slide 20 — Limitations and Responsible AI

State:
- A low-risk result does not prove legitimacy.
- Source availability can change.
- Models may make mistakes across languages and dialects.
- This is safety information, not investment advice.
- Users should independently verify and use official reporting channels.

Slide 21 — Roadmap

Use phases:
- Prototype.
- Multilingual evaluation.
- Official-source adapters.
- Accessibility expansion.
- Privacy and security hardening.
- Controlled pilot.
- Monitoring and feedback.

Slide 22 — Closing / Contact

Use placeholders:
- `[One-line closing message]`
- `[Team members]`
- `[Contact]`
- `[Demo URL]`
- `[QR code placeholder]`

Keep the closing style consistent with the protected cover.

==================================================
7. SLIDE DESIGN RULES
==================================================

Every slide must have:
- One clear title.
- One core message.
- A maximum of 3–5 visual groups.
- Large readable text.
- Adequate whitespace.
- Consistent alignment.
- Source notes where factual claims appear.
- Editable shapes and text wherever practical.

Avoid:
- Dense paragraphs.
- Tiny text.
- More than one major diagram per slide.
- Decorative charts with no purpose.
- Unverified statistics.
- Excessive gradients.
- Inconsistent icon styles.
- Cropped faces or altered images.
- Overlapping objects.
- Low-contrast text.

Use a footer with:
- `[PROJECT NAME]`.
- Slide number.
- `[CONFIDENTIAL / HACKATHON PRESENTATION]` only if appropriate.

==================================================
8. IMAGE AND ASSET POLICY
==================================================

Do not disturb supplied images.

For every image:
- Preserve original file.
- Preserve aspect ratio.
- Do not stretch.
- Do not apply destructive filters.
- Do not remove watermarks or attribution.
- Record source and license in ASSET_INVENTORY.md.
- Use a non-destructive crop only when needed for layout.
- Keep an uncropped original in the assets directory.

If an image contains personal data, blur or replace it only in a duplicate asset and document the change.

If an image is not licensed for presentation use, replace it with a clearly marked placeholder.

==================================================
9. CONTENT AND SOURCE POLICY
==================================================

Use only:
- Supplied project files.
- Verified official sources.
- Clearly identified open-source documentation.
- Properly licensed model cards and datasets.
- Synthetic demo content.

For each factual slide claim, record:
- Claim.
- Source file or URL.
- Date accessed if relevant.
- Confidence or verification status.

Generate:

```text
PRESENTATION_SOURCES.md
```

Never cite an unverified repository README as proof that a feature works.

==================================================
10. OUTPUT VALIDATION
==================================================

Before final delivery, verify:

Content:
- All claims are supported or marked placeholders.
- No investment advice exists.
- No fake affiliation exists.
- No confidential information appears.
- All language claims are qualified.

Design:
- Cover design is unchanged.
- Images are preserved.
- Slides use the extracted design system.
- Text is readable in slideshow view.
- Colours have adequate contrast.
- Visual hierarchy is consistent.

Technical:
- PPTX opens successfully.
- PDF exports successfully.
- No missing fonts or broken images.
- No objects are outside the slide boundary.
- All placeholders are editable.
- All source files are listed.

Create a validation report:

```text
PRESENTATION_VALIDATION_REPORT.md
```

Include:
- Slide count.
- Cover-preservation status.
- Image-preservation status.
- Placeholder count.
- Source coverage.
- Accessibility checks.
- Export status.
- Known issues.

==================================================
11. EXECUTION WORKFLOW
==================================================

Phase 1 — Inventory
- Locate all files recursively.
- Categorise them.
- Identify the existing cover slide.
- Identify protected images.

Phase 2 — Project understanding
- Read documentation.
- Inspect actual implementation.
- Map real features to slides.
- Identify gaps and conflicts.

Phase 3 — Design extraction
- Analyse the cover.
- Generate DESIGN_SYSTEM.md.
- Establish slide layouts.

Phase 4 — Content map
- Generate SLIDE_CONTENT_MAP.md.
- Assign source files to every factual slide.
- Mark unknown values as placeholders.

Phase 5 — Deck generation
- Duplicate the source deck.
- Preserve the cover.
- Generate the remaining slides.
- Keep visuals and placeholders editable.

Phase 6 — Review
- Check readability.
- Check image integrity.
- Check source notes.
- Check technical accuracy.
- Check safe-language requirements.

Phase 7 — Export
- Create editable PPTX.
- Create PDF preview.
- Create validation report.

==================================================
12. FINAL RESPONSE FORMAT
==================================================

Report:

1. Files analysed.
2. Existing cover design identified.
3. Design system extracted.
4. Slides generated.
5. Images preserved.
6. Sources used.
7. Placeholders inserted.
8. Unsupported claims removed or marked.
9. PPTX export status.
10. PDF export status.
11. Validation findings.
12. Remaining manual edits required.

Use the following final statement:

“Presentation template generated as an editable, source-aware, generic SANGYAN hackathon deck. The original cover-slide design and supplied images were preserved, while the remaining slides use a consistent derived design system with editable placeholders.”

==================================================
13. START COMMAND
==================================================

Start by analysing the entire workspace and producing the inventory. Do not generate slides before understanding the files.

Do not modify the original source deck or original image files.
Do not overwrite existing assets.
Do not invent missing content.
Do not claim a file was generated unless it exists and opens successfully.
