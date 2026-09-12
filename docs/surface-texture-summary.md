# Surface and texture system

## Surface, border, and shadow tokens

The existing token architecture remains intact. `src/styles/tokens.ts` and
`src/app/globals.css` now agree on this hierarchy:

- Canvas: `--color-canvas` / neutral 0.
- Recessed: `--color-sunken` / neutral 50.
- Standard: `--color-surface` / neutral 100.
- Raised: `--color-raised` and `--color-overlay` / neutral 0, with a border.
- Default border: `--border-default` (neutral 300 light, 400 dark).
- Strong border: `--border-strong` (neutral 400 light, 500 dark).

The `none`, `sm`, `md`, and `lg` shadow values already matched the approved
Section 3 rgba values; they are retained exactly. Elevation definitions now
resolve to flat fills with `--blur-none`, and `--border-subtle` aliases the
default border rather than introducing another visual treatment.

## Component changes

### GlassCard

`GlassCard` remains the shared elevated-card wrapper because it has many
callers and still provides useful low/medium/high elevation semantics. Its
public props are unchanged, but the rendering is now opaque: `lg` radius,
named warm surface fills, named borders, and the shared shadow scale. Backdrop
blur, transparent-white fill, gradient rim, and contextual glow are removed.
The `glow` prop is retained as a deprecated no-op for safe migration.

It is a candidate for future consolidation with `Card`, but should not be
deleted until its broader padding and HTML-attribute API are reconciled.

### AmbientGlow

`AmbientGlow` preserves its prop interface but no longer renders colored light
or a backdrop-filter fallback. It is now a compatibility wrapper only. It is
still imported by the composed `AllowanceHero`; that import can be removed in
a later focused cleanup once callers no longer need the compatibility surface.

### GradientMesh

`GradientMesh` now renders nothing. The canvas supplies the background, so the
mesh’s orbs, blur, and drift are not displayed. `AppShell` and the unused
`ScrollAware/ParallaxMesh` can be simplified after a deliberate import/API
cleanup; both are candidates for consolidation, not deletion in this pass.

## Tonal wash and texture

- The approved terracotta radial gradient appears only in
  `DailyAllowanceHero` through the `monthly-runway-hero` class. The loading
  hero, sheets, cards, menus, and secondary screens do not apply it.
- The former hero text gradient, ambient glow, breathing light, ring blur,
  new-day glow pulse, and shimmer particles are removed. The Monthly Runway
  card is the sole special surface effect.
- `body::before` supplies the single fixed, non-interactive paper texture.
  It uses the SVG `feTurbulence` tile once globally, `screen` at `0.018` in
  dark mode and `multiply` at `0.025` in `.warm` light mode. It is omitted in
  `forced-colors` mode.

## Other simple substitutions

The reusable quick-log glass pills/chips, app top bar, dock, top-edge band,
and display-gradient compatibility class now use flat fills, named borders,
and named shadows. Their old blur, rim, and halo styling is gone.

## Follow-up flags

The effect scan found older, feature-specific visual treatments outside this
surface-system scope. They are not rendered by the three retired glass/glow
components, but should be reviewed in the later consistency pass:

- Legacy global selectors for the retired mesh/ambient descendants remain
  harmless because `GradientMesh` renders `null` and `AmbientGlow` has no
  children; remove those dead selectors with the related import cleanup.
- `ProfileSheet`, `FriendsSection`, `TransactionFeedback`, `QuickLogControl`,
  `PullToRefresh`, several goal/expense sheets, and the tutorial flow retain
  one-off gradients or radial feedback effects. Slider/progress gradients in
  `TutorialSteps` and `BudgetSettings` are functional data controls and need
  a separate visual decision rather than a blind replacement.
- Additional legacy global effect rules remain for celebrations and historical
  task-specific affordances. They require product judgment to flatten without
  changing their interaction meaning.

## Validation

- `npm run typecheck` — passed.
- `npm run build` — passed.
