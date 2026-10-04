# Design System — NiveshRaksha

An original, calm, safety-tool visual language. Deliberately **not** a trading dashboard: no charts implying performance, no dark neon, no data density for its own sake.

## Foundations

### Colour

| Token | Value | Use |
|---|---|---|
| Base surface | slate-50 / slate-950 (dark) | Page background — quiet, high legibility |
| Surface | white / slate-900 | Cards, header, footer |
| Primary (calm trust) | teal-600 `#0d9488` | Primary actions, brand, progress |
| Warning (attention without panic) | amber-500/700 | "Review carefully", pause mode, cautions |
| Danger (clear, not screaming) | red-600/700 | "High risk" banners and destructive buttons only |
| Text | slate-900/600/400 ladder | Headings / body / muted |

Rules: red appears **only** for high-risk or destructive states; teal is the only brand hue; amber is the bridge between calm and danger. Dark mode mirrors the same semantics via the `.dark` token overrides in `globals.css`.

### Typography & spacing
- Geist Sans (self-hosted via `next/font`); system fallbacks.
- Scale: page titles 3xl–6xl, card titles xl–2xl, body sm–base, meta text xs.
- Spacing on a 4 px grid; cards use `rounded-xl` + soft shadows; borders are 1 px slate-200/slate-800.

### Iconography
Lucide icons, 16–48 px, always paired with text or `aria-hidden` when decorative. No custom mascot, no regulator-style insignia.

## Components (`frontend/src/components/ui/*`)

shadcn/ui-style components on Base UI primitives: `button`, `card`, `alert`, `input`, `label`, `textarea`, `select`, `tabs`, `checkbox`. Conventions:

- Buttons: `default` (teal), `outline` (teal or slate), `ghost`; destructive = red, used sparingly.
- Alerts carry the risk semantics: destructive (high), amber (review/caution), teal (verified/calm).
- Checkbox exists for consent (never pre-ticked) and progress.

## Composed patterns

- **Risk banner** (`result-view.tsx`): colour + title + summary + evidence list; "potential warning sign · severity" chips; matched text in mono quotes.
- **Split card**: "Safe next steps" beside "What we could not verify" — knowledge and honesty get equal space.
- **Provenance rows** (`/about`): source name, URL, mode (mock/static), freshness, checksum.
- **Privacy notice**: inset card with eye-off icon beside every sensitive input.
- **Empty/loading/error trio**: every async surface has all three (dashed empty state, spinner with explanatory copy, red alert with next-step copy).

## Motion
Minimal. Spinners and one fade/slide on results. All of it is disabled by the reduce-motion toggle and OS preference.

## Screen inventory
See `UI_SCREEN_MAP.md`. The system explicitly forbids: fake testimonials, fake counters, regulator logos, decorative stock charts, fear-based motion, unexplained percentages, dark patterns, preselected consent.
