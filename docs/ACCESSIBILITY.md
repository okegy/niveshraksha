# Accessibility Statement — NiveshRaksha

Target: WCAG 2.1 AA for the flows we ship.

## Built in

- **Keyboard operability**: all interactive elements are native buttons/links/inputs/selects; visible focus rings (`focus-visible` ring tokens); no keyboard traps. The pause checklist is real checkboxes inside labels.
- **Screen-reader semantics**: landmark structure (banner/nav/main/contentinfo); ARIA labels on icon-only buttons; `aria-pressed` on toggles; `aria-live="polite"` on result and status regions; `role="alert"` on errors; decorative icons marked `aria-hidden`.
- **Contrast**: slate/teal/amber/red pairings chosen to meet AA on their backgrounds (teal-600 on white for primary actions, red-700 on red-50 for high-risk titles).
- **Touch targets**: primary buttons ≥48 px, nav items ≥40 px min-height.
- **Reduced motion**: OS-level `prefers-reduced-motion` respected via CSS; a manual **reduce-motion** toggle in the header additionally disables all animations/transitions app-wide and persists.
- **Large text**: header **A+** toggle scales root typography (1.15×) and persists; layouts reflow (no fixed-height text containers).
- **Language**: `lang` metadata on the document; 6-language UI; language choice announced via the labelled select.
- **Forms**: every input has a programmatic label (Label + htmlFor); errors render as role=alert text next to the form.
- **No-motion information**: all state changes are conveyed by text/colour+text, never motion or colour alone.

## Verified / not yet verified

- ✅ Manual keyboard walkthrough of landing → analyze → result → verify → report → learn.
- ✅ ARIA tree inspection via automated DOM snapshots during build.
- ⬜ Automated axe-core / Lighthouse CI run — not yet wired; planned.
- ⬜ Screen-reader session (NVDA/TalkBack) recording — not yet done.

Known gaps are tracked honestly rather than claimed away: SVG icons rely on `lucide-react` defaults; dark-mode contrast for some amber body text is tuned for light mode first.
