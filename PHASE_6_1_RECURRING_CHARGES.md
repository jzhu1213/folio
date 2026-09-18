# Phase 6.1 — Recurring Charges

Recurring obligations now have a first-class `recurring_charges` Supabase record rather than being represented only by individual transaction flags. It stores the charge name, category, amount, frequency, next due date, fixed-versus-variable classification, subscription flag, and active state. `transactions.recurring_id` remains the link to the charge, preserving Phase 2.6's existing recurring flagging model and its historical transaction ledger.

Migration `0009_recurring_charges.sql` promotes flagged expense transactions. Existing rows with a `recurring_id` reuse that UUID as the new charge ID; flagged rows without one receive a new charge ID and are updated to point to it. The client hook also normalizes older local recurring-bill data to the richer record shape while retaining an offline fallback.

The redesigned Recurring screen has a fixed-commitments summary followed by two independent sections: **Fixed obligations** (rent, phone plans, subscriptions) and **Variable recurring** (for example, utilities). Rows show the Phase 2 category icon/label, amount, and frequency. Selecting a row opens an edit sheet; the row menu soft-deactivates it, preserving linked transaction history. Creation, subscription-specific treatment, and upcoming-date UI are intentionally deferred to Phases 6.3, 6.2, and 6.4.

Verified on September 17, 2026:

- `npm run typecheck` passes.
- `npm run build` passes.
