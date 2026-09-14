# Phase 2.7: Confirmation Feedback Tied to the Monthly Runway

## Implementation

- Added `src/lib/confirmationFeedback.ts`, an isolated `buildExpenseConfirmation` function that creates quick-add confirmation copy from the proposed post-save state.
- Wired the function into `ExpenseSheet` through the existing save confirmation path, including habit chips and one-tap suggested amounts. `Toast.tsx` itself is unchanged: its positioning, `toastSlide` motion, visual treatment, and polite live-region behavior remain intact.
- The sheet now waits for the existing save promise before it shows its confirmation. The helper includes the submitted amount in the calculation so the message does not use the pre-save remainder while React state is reconciling an optimistic transaction.

## Budget source and message templates

Category-level budget data already exists in `Budget` (`category`, `monthlyLimit`, `spent`, and `month`), so this implementation prefers the category budget when one exists for the transaction month.

- Category budget, on pace: `Logged {amount} to {category}. {remaining} left in {category} this month.`
- Category budget, over pace: `Logged {amount} to {category}. You may be about {shortfall} short in {category} this month.`
- Monthly Runway fallback, on pace: `Logged {amount} to {category}. {remaining} left this month.`
- Monthly Runway fallback, over pace: `Logged {amount} to {category}. You may be about {shortfall} short by {month-end}.`

The fallback mirrors the Monthly Runway projection: month-to-date spending divided by elapsed days and projected through the calendar month. It is contained in the helper so a later category-budget enhancement only needs to adjust that one decision point.

## Backfill and accessibility

- Same-day and permitted current-month backfilled entries use the transaction's effective date. Backfilled expenses are included in their actual month/day position for the runway calculation, then projected from the updated month-to-date total.
- The helper receives the saved amount as a proposed transaction, preventing a stale pre-save figure in either case.
- `Toast.tsx` retains `role="status"` and `aria-live="polite"`, so the dynamic confirmation continues to be announced when it appears.

## Validation

- `npm run typecheck` — passed.
- `npm run build` — passed.
