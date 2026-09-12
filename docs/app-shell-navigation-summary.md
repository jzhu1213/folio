# App shell and navigation restyle

## Updated visual elements

- **Shell and content canvas:** `AppShell` and its content area now explicitly use the warm-neutral canvas surface.
- **Top bar:** changed from glass-adjacent chrome to a raised flat surface with the default border and `sm` shadow. Its divider is now a strong-border token rather than a purple/white gradient.
- **Top-bar controls:** avatar and settings controls now use quiet surfaces, default borders, token-timed interaction states, and terracotta hover/focus treatment. The wordmark now uses the display family and a solid warm-neutral color with a non-glowing terracotta dot.
- **Navigation dock:** changed to the raised surface tier (`--color-raised`, default border, `md` shadow) with no backdrop blur. The active item uses terracotta and accent-muted fill; inactive items use muted neutrals.
- **Tab labels:** use the Phase 1.3 label/button typography role.
- **Quick-log FAB:** replaced the retired purple gradient and glow with a flat terracotta fill and `md` shadow. Its hover, press, and focus behavior now comes from `interactive-control` and `focus-ring`.
- **Focus rings:** their halo now derives from the terracotta accent token instead of a hardcoded indigo color.

## Navigation and motion

- All shell navigation icons remain rendered by the shared `Icon.tsx` Lucide wrapper: the top-bar person/settings controls, the quick-log add control, and every `NavigationDock` tab.
- The dock keeps its existing tablist semantics, arrow-key navigation, tab destinations, and routing callbacks. No navigation structure changed.
- Active-tab highlighting uses the shared token-derived `toastEnter` transition. Reduced-motion users receive an opacity-only active-highlight transition rather than a shared-layout slide.

## Safe area and layout

- The existing `safeArea` bottom placement for the dock and the shell’s `--safe-top` / `--safe-bottom` CSS variables were not changed.
- Scroll preservation, swipe navigation, rubber-band scroll behavior, and the existing top-bar/FAB scroll response remain intact.

## Validation

- `npm run typecheck` — passed.
- `npm run build` — passed.
