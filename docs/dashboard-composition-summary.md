# Dashboard composition rebuild

## Screen traced

`src/components/simplified/HomeScreen.tsx` is the home/dashboard composition rendered inside `src/components/ui/AppShell.tsx`. `RateDisplay.tsx` is an unrelated exchange-rate component; it does not render the home hero. `AppShell` supplies the persistent top bar, quick-log FAB, dock navigation, and scroll container; those are retained.

## Previous sections and disposition

- **Daily allowance hero** — **kept and renamed in presentation** as the Monthly Runway at the top.
- **Hero context row** (streak, pace, savings, period, suggestions, coming-up, split, and budget status signals) — **relocated** below the primary composition as supporting status; none of its interactions were removed.
- **Log expense / log income actions** — **relocated** after the snapshot and insight as a secondary action group; both callbacks remain unchanged.
- **Log Again repeat chips** — **kept** in the secondary scroll area.
- **Coming Up and suggested entries** — **kept** in the secondary scroll area.
- **Top-four category-budget grid** — **merged** into the new snapshot row. Each item still opens the same `CategoryDetailSheet`; the existing “See all” route still opens budget settings.
- **Recent transactions** (including empty state, swipe actions, inline edit, and history link) — **kept** in the secondary scroll area.
- **Category detail, affordability, streak, setup, milestone-share, and celebration sheets/overlays** — **kept**; these are conditional flows, not competing dashboard tiles.
- **Welcome, what’s-new, setup, and contextual-tip cards** — were already relocated to settings, a sheet, or toast delivery before this pass; **kept in those destinations**.

## Implemented composition

1. Monthly Runway
2. Spending snapshot: up to four current categories, selected from the existing budget-priority ordering and linked to category detail
3. One plain-language insight line
4. Existing quick actions and supporting status
5. Existing secondary scroll content

The insight is intentionally a placeholder for the later insights phase. It chooses the strongest existing category signal: over limit, near limit, highest weekly spend, or an empty-state prompt. It adds no fetches and uses only the existing category-budget calculation.

## Visual and interaction system

- Snapshot items use `CategoryIcon`, which resolves to the shared Lucide icon system; no hand-drawn illustration is used on this screen.
- New snapshot surfaces use the established quiet surface, default border, `lg` radius, and `sm` shadow tokens. New headings and body copy use the approved typography roles.
- The screen continues to use its existing token-derived `homeSection` motion variants; no new component-local transitions were added.

## Validation

- `npm run typecheck` — passed.
- `npm run build` — passed.
