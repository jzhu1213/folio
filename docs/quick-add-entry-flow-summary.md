# Quick-add entry flow summary

## Scope and entry point

The active quick-add flow is [`src/components/simplified/ExpenseSheet.tsx`](../src/components/simplified/ExpenseSheet.tsx), opened from [`src/app/page.tsx`](../src/app/page.tsx). `QuickLogArea` was reviewed and is a legacy component with no active invocation, so it was not changed.

The expense sheet now uses the shared [`BottomSheet`](../src/components/ui/BottomSheet.tsx) with its default `slideUpSheet` presentation. The former FAB-origin transition payload was removed from [`src/app/page.tsx`](../src/app/page.tsx) and [`src/hooks/useOverlayRouter.ts`](../src/hooks/useOverlayRouter.ts), so opening quick-add goes straight to the amount-entry sheet rather than through a distinct visual mode.

## Amount-first presentation

- The first actionable element is a large, focused amount field, backed by the existing [`NumericInput`](../src/components/ui/primitives/NumericInput.tsx) input behavior.
- `NumericInput` now has a reusable `hero` size plus optional ref, keyboard handler, class name, and style overrides for this presentation.
- The field uses DM Sans through the shared `FONT_FAMILY` interface token, not Fraunces. This deliberately follows the creative-direction boundary: the large amount is a functional data-entry control, whereas Fraunces is reserved for monthly-runway, screen-title, section-headline, and milestone contexts.
- The amount uses `font-variant-numeric: tabular-nums` and a responsive `clamp(44px, 14vw, 56px)` size so digits remain steady and prominent from mobile through desktop widths.
- The close and Log expense actions use the established `focus-ring` and `interactive-control` behavior with flat raised/recessed surfaces, solid borders, and directional shadows.

## Category hand-off to Phase 2.4

`ExpenseSheet` now includes a clearly labeled, functional temporary category select: “Illustrated category grid coming in Phase 2.4.” It preserves the existing category state and transaction-save path while the legacy category grid is held out of the rendered flow. Code comments mark both locations for replacement by the Phase 2.4 illustrated grid. No Phase 2.2 illustrations are wired into quick-add in this change.

## Accessibility and dismissal

- The amount field retains text input with `inputMode="decimal"` and a numeric decimal pattern, giving mobile users a decimal keypad while allowing controlled decimal entry.
- It has the explicit screen-reader label “Expense amount in dollars” and connected helper text distinct from the visual `0.00` placeholder.
- Opening the sheet moves focus to the amount field after the shared sheet completes its focus setup. The visible focus styles come from the established `focus-ring`/`interactive-field` classes.
- Users can dismiss with the labeled close action or the shared BottomSheet’s existing drag, backdrop, and Escape behavior. An unsaved draft is preserved across dismiss/reopen; a successful submission resets the next draft as before.

## Validation

- `npm run typecheck` — passed.
- `npm run build` — passed.
- Browser interaction check — passed: opening “Log expense” focused `#quick-add-amount`; its `type="text"`, `inputmode="decimal"`, accessible label, described-by helper, DM Sans font, and tabular numerals were present. The dialog was labeled “Log expense,” the explicit close control and Phase 2.4 category placeholder were present, and a `12.50` draft survived close and reopen.
