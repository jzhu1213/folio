# Folio creative direction

Folio should feel like a well-used personal desk calendar: warm, legible, calm, and specific. It is not a neon finance dashboard, a generic SaaS workspace, or a floating-glass interface. The visual anchor is the student’s month in motion: what has happened, what remains, and whether the current pace is sustainable.

## 1. Color palette

Use the following 11-step warm-neutral scale in each mode. These are the only UI neutrals for backgrounds, surfaces, borders, and text.

| Step | Light mode | Dark mode | Intended use |
| --- | --- | --- | --- |
| 0 | `#FFFDF8` | `#211F1B` | App canvas |
| 50 | `#FAF6EE` | `#292620` | Recessed canvas |
| 100 | `#F3EDE2` | `#333029` | Quiet surface |
| 200 | `#E8DFD1` | `#403B33` | Raised surface |
| 300 | `#D9CEBD` | `#544D42` | Strong surface / disabled border |
| 400 | `#BCAF9C` | `#70675A` | Default border |
| 500 | `#958977` | `#908576` | Strong border / secondary figure |
| 600 | `#706759` | `#B0A696` | Muted text |
| 700 | `#514A40` | `#CEC5B8` | Secondary text |
| 800 | `#352F28` | `#E7DFD4` | Primary text on inverse surface |
| 900 | `#211C17` | `#FFF9F0` | Primary text |

The sole UI accent family is **terracotta**. It is warm, grounded, and distinct from the old blue/indigo/purple direction.

| Token | Light mode | Dark mode |
| --- | --- | --- |
| Accent base | `#B65332` | `#E58A63` |
| Accent hover | `#99442A` | `#F0A17E` |
| Accent active | `#7A351F` | `#FFC0A3` |
| Accent muted | `#F5DED3` | `#4A2D24` |

Use this compact semantic trio only for status, never as a second brand palette.

| Meaning | Base, light | Muted, light | Base, dark | Muted, dark |
| --- | --- | --- | --- | --- |
| Success | `#5E7D4E` | `#E3EBDD` | `#9FBE8B` | `#2F4029` |
| Warning | `#9A6A21` | `#F5E8C8` | `#D6A852` | `#4B3920` |
| Danger | `#A84D43` | `#F4DCD7` | `#DF8B80` | `#4D2925` |

`src/styles/chartTokens.ts` remains a separate, brighter category/data-visualization palette. It is intentionally out of scope: category markers and charts need more categorical separation than the calm UI palette.

## 2. Typography

Use **Fraunces** as the display family, loaded from Google Fonts as a variable font. Its soft serif details make totals and monthly cues feel editorial without becoming formal. Use `Georgia, serif` as its fallback.

Use **DM Sans** as the interface family, loaded from Google Fonts. It is the sole grotesk for body copy, labels, tables, controls, and compact numerical data. Use `Arial, sans-serif` as its fallback.

| UI role | Family | Size / line height | Weight | Rules |
| --- | --- | --- | --- | --- |
| Monthly runway number | Fraunces | `48px / 50px` | 600 | Tabular numerals if available; never abbreviated unless space requires it. |
| Screen title | Fraunces | `30px / 34px` | 600 | One per screen; sentence case. |
| Section headline | Fraunces | `22px / 28px` | 550 | For meaningful content groups only, not utility labels. |
| Card headline | DM Sans | `16px / 22px` | 600 | Used in dense cards and rows. |
| Body | DM Sans | `15px / 22px` | 400 | Default explanatory copy. |
| Label / button | DM Sans | `13px / 18px` | 600 | No all-caps except compact table headers. |
| Caption | DM Sans | `12px / 16px` | 500 | Supporting timing, source, and metadata. |
| Data table figure | DM Sans | `14px / 20px` | 600 | Use `font-variant-numeric: tabular-nums`. |

Fraunces appears only for the monthly-runway amount, screen titles, section headlines, and milestone statements. DM Sans appears everywhere functional: navigation, form controls, lists, tables, chart labels, body copy, and button text. Do not use Fraunces inside compact controls, settings rows, or data tables.

## 3. Surface and texture system

Replace glass, backdrop blur, transparent white fills, gradient rims, and floating halos with flat warm surfaces.

- Canvas: neutral step 0.
- Recessed inputs and chart wells: neutral step 50.
- Standard cards and list groups: neutral step 100.
- Raised cards, sheets, and menus: neutral step 0 with a border.
- Default border: `1px solid` neutral step 300 in light mode and neutral step 400 in dark mode.
- Strong border: `1px solid` neutral step 400 in light mode and neutral step 500 in dark mode.
- Radius: retain the established `4px`, `8px`, `16px`, and full-pill scale; cards and sheets use `16px`.

Use directional shadows sparingly:

- `none`: `none`
- `sm`: light `0 1px 2px rgba(57, 43, 30, 0.08)`; dark `0 1px 2px rgba(0, 0, 0, 0.22)`
- `md`: light `0 8px 20px rgba(57, 43, 30, 0.10)`; dark `0 8px 20px rgba(0, 0, 0, 0.28)`
- `lg`: light `0 18px 42px rgba(57, 43, 30, 0.14)`; dark `0 18px 42px rgba(0, 0, 0, 0.36)`

The only permitted special effect is a **tonal terracotta wash behind the Monthly Runway hero on the home screen**: `radial-gradient(circle at 82% 12%, rgba(182, 83, 50, 0.16), transparent 58%)` in light mode and `radial-gradient(circle at 82% 12%, rgba(229, 138, 99, 0.14), transparent 58%)` in dark mode. It is not glass, does not blur, and must not appear on other screens. Every other surface is flat.

Use one subtle paper texture globally: a fixed pseudo-element containing a monochrome SVG `feTurbulence` noise tile, `mix-blend-mode: multiply` at `opacity: 0.025` in light mode and `mix-blend-mode: screen` at `opacity: 0.018` in dark mode. It must be non-interactive, fixed behind content, and omitted under forced-colors mode. Do not apply texture per card.

## 4. Iconography and illustration

**Lucide remains the sole structural icon library.** Use it for navigation, chevrons, settings, close controls, status controls, form affordances, and all utility actions. Use the existing `Icon.tsx` wrapper and semantic registry; do not add a second utility icon library.

A separate hand-drawn illustration system is reserved for emotional moments only: quick-add category selection, empty states, and savings-goal milestones. Each illustration must follow these rules:

- 2px rounded monoline at a 48px artboard; no filled silhouettes except a single small focal fill.
- Simple, slightly imperfect geometry: one central object, at most two supporting marks, and generous empty space.
- Use one terracotta accent plus warm-neutral linework; semantic color appears only when the illustration represents a success, warning, or danger state.
- No gradients, glow, photorealism, 3D rendering, sticker outlines, emoji faces, or more than three visible colors.
- Keep the detail level readable at 32px, with no text embedded in the art.

Never mix Lucide utility icons and hand-drawn illustrations inside the same local control, list row, card header, or navigation view. A full empty-state panel may place a hand-drawn illustration above Lucide-based buttons; that is the only permitted co-presence because the systems serve different hierarchy levels.

## 5. Motion personality

Keep the existing token system: `--duration-fast` (`150ms`), `--duration-base` (`200ms`), `--duration-slow` (`300ms`), with the established enter and exit curves. New motion must use those tokens or existing token-derived Motion presets.

- Everyday controls feel restrained: one-pixel lift on hover, `0.98` press scale, and no bounce.
- Panels, sheets, and empty states enter once using the enter curve; they never overshoot.
- Monthly runway changes animate the number and sparkline over `300ms` with the enter curve. The line draws left-to-right once, then stays still; it must not continuously pulse or drift.
- A completed savings milestone may use one celebratory `300ms` scale-up to `1.03`, settle to `1`, and reveal the hand-drawn illustration. It happens once per completion, never loops, and becomes a simple opacity fade with reduced motion.
- Warning and danger states do not shake, flash, or bounce. They use a calm color/background change and plain-language copy.
- `prefers-reduced-motion` reduces all entrances to opacity-only fades and freezes decorative texture/motion effects.

## 6. Naming and voice

The home hero is named **Monthly Runway**. It represents the month’s remaining plan, not a generic account balance.

Use this projection pattern exactly:

> **At this pace, you’ll have about {amount} left by {month-end}.**

When the projection is below zero, use this exact non-alarming alternative:

> **At this pace, you may be about {amount} short by {month-end}.**

Use sentence case, contractions where natural, and concrete dates or month names. Avoid “overspend,” “failure,” “risk score,” urgent punctuation, and clinical financial jargon.
