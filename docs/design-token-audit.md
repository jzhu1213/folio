# Design Token Audit

Scope: `tailwind.config.ts` and all nine requested `src/styles/*.ts` files, with component-use searches limited to `src/components`. This is an audit only; no runtime token, component, or Tailwind changes are included.

## Executive summary

The system has a strong CSS-variable foundation, but it is not a single system in practice. The primary drift is duplicated accessors and parallel numeric scales: `src/styles/shared.ts` preserves an older 560px/8–20px system while `layout.ts` and `surfaces.ts` use 480px/4–28px. Motion is split between `src/styles/motion.ts`, `src/lib/animations.ts`, Tailwind animation literals, and component-local strings.

| Area | Finding | Risk |
| --- | --- | --- |
| Color | Five 10-step semantic ramps, a 12-color category palette, raw chart colors, and literal component colors coexist. | High |
| Radius | Three overlapping scales expose at least 10 distinct defined values/forms. | High |
| Layout | `CONTENT_MAX_WIDTH` disagrees (480px vs 560px). | High |
| Motion | `durations`/`easings` have no direct component consumers; 822 component transition-related matches are mostly local. | High |
| Spacing | A 4px-based scale exists, but 2/3/5/6/7/9/10/14/18/22px literals are common. | High |

## Cross-reference: Tailwind versus TypeScript token sources

`tailwind.config.ts` only extends color, font family, radius, shadow, and animation/keyframe families. It **does not** extend spacing, font size, transition duration, or transition timing functions, so those areas cannot be consumed consistently through Tailwind utilities.

| Family | Tailwind definition | TypeScript / CSS counterpart | Audit result |
| --- | --- | --- | --- |
| Color | `tailwind.config.ts:12-54` maps semantic names to CSS variables; accent fallback is `#818cf8`, info fallback `#60a5fa`. | `colors.ts:62-70`; `globals.css:44-151`. | Semantic defaults match, but `colors.ts` adds `caution` and an `info` alias while `shared.ts:64-70` duplicates a smaller ramp set. |
| Font family | `tailwind.config.ts:55-57`: `Inter, sans-serif`. | `typography.ts:27-28`: Inter plus system fallbacks. | Near-equivalent intent, different fallback stack. |
| Font size | No extension. | `typography.ts:103-197` defines 10 styles backed by `globals.css:155-205`. | Tokenized inline styles cannot be expressed as Tailwind font-size utilities. |
| Spacing | No extension. | `typography.ts:261-270` and `layout.ts:26-64`. | Two overlapping scales; Tailwind defaults and inline literals remain another path. |
| Radius | `tailwind.config.ts:58-63`: `--radius-sm/md/lg`, `full`. | `surfaces.ts:140-164`; `shared.ts:145-152`; `globals.css:225-229,393-396`. | Conflicting scales and two CSS-variable families. |
| Shadow/glow | `tailwind.config.ts:64-72`: `sm` through `xl`, two glows. | `surfaces.ts:74-108`; `shared.ts:324-334`; `globals.css:244-248,410-411`. | Same variable names are repeated in three access paths; values themselves are centralized in CSS. |
| Duration/easing | No `transitionDuration` or `transitionTimingFunction` extension. Tailwind animation values are hardcoded at `tailwind.config.ts:74-104`. | `motion.ts:55-97`; resolved values in `globals.css:271-281`. | No single duration/easing API is adopted. |

## Conflicting or duplicated tokens

| Token / family | Locations | Evidence | Recommendation |
| --- | --- | --- | --- |
| Content width | `layout.ts:82` = `480`; `shared.ts:126` = `560`. | Both are imported by components. | Retire the shared constant; choose one responsive content-width policy. |
| Radius scales | `surfaces.ts:142-164` = 4/12/20/28/full; `shared.ts:147-152` = 8/12/16/20/full; Tailwind/`globals.css:393-396` = 8/12/16/full. | Same control/card intent resolves to different values and names. | Replace with one four-step scale. |
| Duration `instant` | `motion.ts:58-73` documents 0ms; `globals.css:271` resolves `--duration-instant` to 100ms. | The accessor returns the CSS value, not the documented value. | Correct the source definition and documentation together. |
| Color ramps | `colors.ts:62-70` and `shared.ts:64-70`. | Both build 10-step `accent/success/warning/error/blue` ramps; only `colors.ts` includes `caution` and `info`. | Keep one builder/export; `shared.ts` should only re-export it temporarily. |
| Semantic status colors | `colors.ts:62-70`, `globals.css:71-151`, and Tailwind `t.*` aliases at `tailwind.config.ts:33-52`. | Success, warning, caution, error, blue/info all have 10-step ramps, plus legacy aliases. | Collapse to one compact semantic trio only where status states need it. |
| Motion sources | `motion.ts`, `src/lib/animations.ts:36-96`, `chartTokens.ts:115-134`, and Tailwind animation strings. | All define durations/easing independently. | Route CSS and Framer Motion through the same named timing vocabulary. |

## Inventory and drift signal

The counts below intentionally include definitions, not every theme-resolved value. Literal-color count normalizes whitespace/case across the requested style files, Tailwind config, and `globals.css` because those CSS variables supply the actual values.

| Family | Current inventory | Assessment |
| --- | --- | --- |
| Colors | **186** distinct normalized literal color expressions: 63 hex and 123 `rgb`/`rgba` forms. The foundational system alone has five surface colors, three text colors, five 10-step semantic ramps, four gradients, plus 12 category accents (`shared.ts:78-91`) and raw chart colors (`chartTokens.ts:25-55`). Components add 30 distinct literal expressions. | **Severe drift.** This is far beyond 8–10 non-neutral colors. |
| Radius | At least **10** defined values/forms across token families: 2, 4, 8, 12, 16, 20, 28, 50%, 99, and 9999px; components also use 1/3/10/14px directly (for example `SettingsPrivacySecurityScreen.tsx:175`, `InsightTrendCard.tsx:85`). | **Drift.** Exceeds the 4–5-value guideline. |
| Shadow/glow | **8 named values**: none, sm, md, lg, xl, glow-accent, glow-accent-strong, focus-ring (`shared.ts:324-334`), plus local shadows/drop-shadows. | **Drift.** More than the four useful depth levels. |

## Defined but not used by `src/components`

Types are excluded below unless they mask a runtime token. Results are exact identifier searches across `.ts`/`.tsx` under `src/components`.

| File | Runtime tokens with no component use | Notes |
| --- | --- | --- |
| `tokens.ts` | `focusRing`, `focusRingStyle`, `focusRingReset` | `opacity` and `zIndex` are used. |
| `typography.ts` | `ROOT_FONT_SIZE_PX`, `FONT_WEIGHT_TRANSITION_MS`, `FONT_WEIGHT_TRANSITION_EASING`, `fontWeightTransition`, `expressiveDisplay`, `typeStyle` | `pxToRem`, `FONT_FAMILY`, `fontWeights`, `spacing`, and `typography` are used. |
| `motion.ts` | `durations`, `easings` | All six `springPresets` are consumed directly or through `src/lib/animations.ts`; no component references the CSS duration/easing accessors. |
| `surfaces.ts` | `tierMap`, `radiusValues`, `nestedRadius` | `elevations` and `radius` are heavily used. |
| `layout.ts` | `safeAreaPadding`, `HORIZONTAL_PADDING_MIN` | `spacingScale`, `contentColumn`, `safeArea`, `safeAreaBottom`, and `safeAreaTop` are used. |
| `shared.ts` | `sectionHeading`, `sectionHeadingStrong`, `pillButton`, `textTruncate`, `textClamp2`, `textClamp3`, `textBreakWord`, `buttonTextDefensive`, `chipTextDefensive`, `flexRowOverflowSafe` | The two headings are deprecated aliases; preserve until a separate cleanup phase. |
| `chartTokens.ts` | `chartMarkerShapes`, `getMarkerPath` | `ChartMarkerShape` is only a type; it has no component import. |

## Motion audit

### Defined values

| Source | Durations / curves |
| --- | --- |
| `motion.ts:55-73` | `instant`, `fast`, `normal`, `slow`, `slower` → CSS vars. Resolved in `globals.css:271-275` as 100/150/250/400/600ms. |
| `motion.ts:80-97` | `default` = `cubic-bezier(.4,0,.2,1)`; `in` = `cubic-bezier(.4,0,1,1)`; `out` = `cubic-bezier(0,0,.2,1)`; `spring` = `cubic-bezier(.175,.885,.32,1.275)`. |
| `tailwind.config.ts:74-104` | Animation literals at 0.2/0.25/0.5/1s with `ease-out`; they bypass `motion.ts`. |
| `chartTokens.ts:115-134` | Local 0.4/0.5/0.6s strings and three distinct curves. |
| `src/lib/animations.ts:58-69` | A second runtime timing API: 0.1/0.15/0.25/0.4s, `easeOut`, `easeInOut`, and a custom curve. |

There are **no direct component references** to `durations` or `easings`. By contrast, a component search found **822** transition-related matches, including inline values such as `LessonCard.tsx:42` (`opacity 0.2s ease`), `GoalsScreen.tsx:820` (`background 0.2s`), `ToolsScreen.tsx:656` (`transform 200ms ease`), and Tailwind `transition-all duration-300` in `OnboardingTutorial.tsx:549`.

## Spacing audit

Both declared spacing collections have a 4px basis, but they differ:

- `typography.ts:261-270`: 4, 8, 12, 16, 24, 32, 48, 64.
- `layout.ts:26-64`: 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96.

Components contain **2,114** heuristic matches for literal spacing properties/classes. Some are valid micro-adjustments, but off-grid values recur in ordinary layout: 6px gaps (`RecurringBillsScreen.tsx:633`), 10px control padding (`ManageSavingsAccountsScreen.tsx:632`), 14px margins/padding (`RecurringBillsScreen.tsx:449`; `InsightTrendCard.tsx:85`), and 18px card padding (`MonthlyDigestCard.tsx:64`). The project is **not** consistently operating on a single 4px or 8px scale.

## Proposed Consolidation

### Source of truth

Make **`src/styles/tokens.ts` the sole TypeScript source of truth**. It should export typed, resolved token definitions (colors, spacing, radii, shadows, motion) and generate CSS-variable references. `tailwind.config.ts` should import the serializable token map from it and expose matching Tailwind names; it must not independently choose values. `globals.css` remains the theme-value implementation generated from, or mechanically aligned with, that source. In the transition phase, `colors.ts`, `surfaces.ts`, `layout.ts`, and `shared.ts` should become compatibility re-export modules only.

### Unified token set (proposal; not applied)

| Family | Proposed tokens |
| --- | --- |
| Neutral | 11 steps: `neutral-0/50/100/200/300/400/500/600/700/800/900`, spanning canvas through high-emphasis text. Surface and text aliases derive from these values rather than adding new literals. |
| Accent | `accent-muted`, `accent`, `accent-hover`, `accent-active` only. Use the current indigo family as the migration base. |
| Semantic | One optional compact trio: `success`, `warning`, `danger`, each with base + muted only. Remove the separate caution, blue/info ramp, and status 50–900 scales unless a concrete accessibility use requires one. Transaction-category colors are data visualization metadata, not global UI tokens. |
| Radius | Four steps: `sm: 4px`, `md: 8px`, `lg: 16px`, `full: 9999px`. Map sheets and large cards to `lg`; remove 12/20/28px aliases after migration. |
| Shadow / glow | Four steps: `none`, `sm` (resting), `md` (raised), `lg` (overlay). Represent glass glow as an optional accent modifier on `md`/`lg`, not separate independent elevations. Preserve blur as two named surface properties: raised 16px and overlay 32px. |
| Motion | `fast: 150ms`, `base: 200ms`, `slow: 300ms`; `enter: cubic-bezier(.22,1,.36,1)` and `exit: cubic-bezier(.4,0,1,1)`. Springs remain only for genuinely physical interactions (sheet drag, press/release). |
| Spacing | `space-1: 4px`, `space-2: 8px`, `space-3: 12px`, `space-4: 16px`, `space-5: 24px`, `space-6: 32px`, `space-7: 48px`, `space-8: 64px`, `space-9: 96px`; allow 2px only for hairlines/progress detail. |

### Migration rules for the next phase

1. Define the new values once in `src/styles/tokens.ts`; use a Tailwind import/reference rather than duplicating literals.
2. Replace `shared.ts` constants with re-exports first, resolving the 480px versus 560px content-width decision explicitly.
3. Replace all component-local transition strings with the motion tokens or Framer Motion transition adapters.
4. Preserve `GlassCard`, `AmbientGlow`, and `GradientMesh`, but derive their blur, border, opacity, and glow from the four-level surface scale.
5. Migrate category/chart palettes separately so financial data distinctions are not lost while global UI colors are simplified.
