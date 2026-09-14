# Backfill and inline recurring summary

## Existing recurring model and inline connection

`RecurringBillsScreen` is backed by `useRecurringBills`, which stores active `FixedExpense` records in the existing `folio-recurring-bills` local-storage collection. A bill requires `label`, `amount`, `category`, `dueDay`, `recurringId`, and `isActive`.

Quick-add now receives the same `addBill` callback from the app shell. When “This repeats · monthly” is selected, saving the transaction also creates one active `FixedExpense` using the entered amount/category, note-or-category label, and selected day of month. It therefore appears in `RecurringBillsScreen` without a second recurrence system. The existing model has no frequency field, so the inline flow deliberately supports monthly recurrence only.

## Backfill range and accessibility

The secondary date control is immediately beneath the amount/category flow and reuses `DatePickerChips`. It defaults to today, provides Today, Yesterday, Last Friday, and native explicit-date selection, and constrains dates from the first day of the current calendar month through today. Future dates are disabled. This avoids arbitrary historical edits while supporting normal late monthly logging.

The date shortcuts and native date input retain accessible labels and keyboard behavior. The recurring control is a native, focus-visible button with `aria-pressed` and the explicit screen-reader label “This expense repeats monthly.” Both controls use flat secondary surfaces and do not compete with amount/category selection.

## Monthly Runway verification

`DailyAllowanceHero` already builds its monthly cumulative series from every transaction’s effective `transaction.date`, grouping spend into the matching day before accumulating forward. `handleExpenseSubmit` passes the selected quick-add date unchanged to `addTransaction`. A backfilled expense therefore changes that day’s sparkline point and every later cumulative point—not only today’s total.

## Validation

- `npm run typecheck` — passed.
- `npm run build` — passed.
