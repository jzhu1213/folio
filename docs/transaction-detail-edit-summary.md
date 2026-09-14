# Phase 3.4 — Transaction Detail and Edit Sheet

## Sheet and reused patterns

- Selecting a current-month history row now opens the shared `BottomSheet`, which uses the established `slideUpSheet` preset, focus trap, Escape/backdrop/swipe dismissal, and focus restoration.
- The editor uses the Phase 2 amount `NumericInput` (DM Sans and tabular numerals), the illustrated horizontal category picker, `DatePickerChips`, the shared `Input` primitive for notes, and the existing inline recurring chip pattern.
- Form values remain local drafts until **Save changes**. The explicit Cancel button, close affordance, Escape key, and swipe dismissal all discard those drafts.

## Mutation and calculation correctness

- Transaction updates now persist `isRecurring` and `recurringId`, and enabling, changing, or disabling recurrence synchronizes the existing fixed/recurring-bill model.
- The optimistic update path calculates category budgets from an explicit post-edit transaction collection, rather than a stale render closure. It recalculates the prior and new expense categories and uses `formatDateLocal` for the current-month boundary.
- Monthly Runway continues to derive from the updated transaction collection. A focused `useHomeData` test moves an expense to a different local day and category, confirming today’s spend and both affected category totals are recomputed.
- Delete removes the transaction through the same optimistic data path, so the day-grouped list, runway, and category spending all update together.

## Deletion and feedback

- Deletion is no longer exposed as a one-gesture history swipe. It requires a distinct in-sheet confirmation state with **Keep it** and **Yes, delete** actions.
- Save and delete extend the Phase 2.7 `confirmationFeedback` formatter with post-mutation feedback, including category remaining amount or Monthly Runway remaining amount. Focused formatter tests verify that edited/deleted amounts are not double-counted.

## Accessibility

- The sheet is a labeled modal dialog with focus containment and restored focus. All controls use the established focus-ring and interactive-control states.
- Category tiles support Tab, Enter/Space, and Arrow/Home/End roving focus. Date chips, inputs, recurrence control, cancel/save, and delete confirmation all have explicit labels and keyboard-operable native controls.

## Validation

- `npm run typecheck` — passed.
- `npx vitest run src/lib/confirmationFeedback.test.ts src/hooks/useHomeData.test.ts` — passed (16 tests).
- `npm run build` — passed.
