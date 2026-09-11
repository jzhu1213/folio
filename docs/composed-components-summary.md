# Composed component visual pass

No data-fetching, state-management, or public prop interfaces changed in this pass.

## GlassCard

**Before:** semantic glow presets and the glass elevation shadows used local RGBA and bespoke shadow values.

**Changed:** glow presets now resolve through the semantic muted CSS tokens. The low, medium, and high elevations use the shared `--shadow-sm`, `--shadow-md`, and `--shadow-lg` scale; their halo keeps the shared 20px accent-glow footprint. Existing `elevation` and custom `glow` props remain unchanged.

**Uses:** radius, shadow, semantic color, and accent-glow CSS tokens.

## AmbientGlow

**Before:** status colors, opacity bands, blur, and transitions were component-local literal values.

**Changed:** status colors now use semantic CSS tokens; opacity derives from the shared opacity scale; blur maps to the overlay blur token; transitions use `--duration-slow` and `--ease-enter`. The one-active-glow constraint and fallback behavior are unchanged.

**Uses:** semantic colors, opacity scale, overlay blur, and motion CSS tokens.

## GradientMesh

**Before:** orb colors, blur, and opacity were hardcoded color/number literals, while the CSS drift already correctly honored reduced motion.

**Changed:** orb colors derive from accent base/hover/active tokens with `color-mix`; blur and opacity derive from the shared blur and opacity tokens. The existing CSS compositor animation remains intentionally in CSS and remains disabled under `prefers-reduced-motion`.

**Uses:** accent colors, blur/opacity tokens, existing reduced-motion CSS fallback.

## Card

**Before:** the composed solid card used a smaller radius and an ad hoc shadow/border in its CSS.

**Changed:** it now uses the `lg` radius, `sm` shadow, and default border tokens. The composed wrapper remains separate from `ui/primitives/Card` because it preserves a broader `HTMLAttributes` and padding-shorthand API; this is documented in the component. It has no clickable variant.

**Uses:** `--radius-lg`, `--shadow-sm`, and `--border-default`.

## EmptyState

**Before:** six raw inline SVG illustrations and local spring/timing values duplicated the icon and motion systems.

**Changed:** named illustrations now render through `Icon`; custom `ReactNode` illustrations remain supported. The container uses `fadeScaleIn` or `reducedFade`, and both actions use the Phase 3 `focus-ring interactive-control` treatment.

**Uses:** `Icon`, `fadeScaleIn`, `reducedFade`, and interactive primitive classes.

## ProfileSheet

**Before:** controls reimplemented press animation, hover mutation, and transition timing locally.

**Changed:** the close, discoverability, save, cancel, edit, and sign-out controls use `focus-ring interactive-control`. The toggle thumb keeps a token-based position transition. It continues to compose `BottomSheet`, inheriting its `slideUpSheet` and reduced-motion behavior.

**Uses:** `BottomSheet`, consolidated radius/shadow tokens, and interactive primitive classes.

## FriendsSection

**Before:** the section used raw SVG and emoji UI indicators, a text-only loading state, a local empty state, and local spring transitions for its disclosure and action buttons.

**Changed:** chevron/link UI glyphs use `Icon`; loading uses `SkeletonText`; the empty state composes `EmptyState`; controls use `focus-ring interactive-control`; and disclosure motion uses token-derived transitions with `reducedFade`. Multi-action rows remain local because replacing them with the press-oriented `ListRow` primitive would change their non-press behavior.

**Uses:** `Icon`, `SkeletonText`, composed `EmptyState`, `motionTransitions`, `reducedFade`, and interactive primitive classes.

## Validation

- `npm run typecheck` — passed.
- `npm run build` — passed. The build environment could not download the Google Fonts Inter stylesheet, so Next.js skipped font optimization; compilation and static generation completed successfully.
