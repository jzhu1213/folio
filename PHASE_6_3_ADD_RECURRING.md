# Phase 6.3 — Adding a Recurring Charge

The dedicated Recurring screen now has an **Add charge** action in its header and empty state. It opens the same bottom-aligned edit-sheet pattern used for an existing charge, collecting name, category, amount, frequency, next due date, fixed-versus-variable type, and subscription status. Required name, amount, category, and frequency are enforced by the existing save guard.

Quick add stays intentionally small: its existing repeating toggle is now labelled **Make recurring** and reveals only an **Every** frequency selector. On save, the normal expense transaction is still logged as a one-off History entry. The additional recurring-charge record uses the entered amount/category/name and defaults its next due date to one full selected interval after the transaction date (7 days weekly, 14 days biweekly, one month monthly, and so on).

Both paths call `useRecurringBills.addBill`, which normalizes and persists the same `recurring_charges` data model introduced in Phase 6.1. Hook state is updated synchronously after creation, so the new record appears immediately in the right Recurring section: subscriptions under Fixed obligations, rent as fixed, and other quick-add charges as variable recurring.

Verified on September 17, 2026:

- `npm run typecheck` passes.
- `npm run build` passes.
