# Phase 6.2 — Subscription-Specific Treatment

Subscription rows use the existing Phase 2 category emoji/icon in a dedicated logo slot. No merchant-logo source or logo API is integrated in Folio, so no external dependency was introduced.

Within **Fixed obligations**, subscriptions appear in their own group before other fixed costs and are ordered by `nextDueDate`, nearest renewal first. A normal row shows the category icon, service name, plain-language renewal copy (for example, “Renews in 4 days”), and a normalized monthly cost. Non-subscription fixed obligations keep the original compact 6.1 row unchanged.

The `Flag unused` control follows the visible, inline row-action fallback used by History/TransactionList for actions that must work without a swipe gesture. Flagging is persisted as `is_flagged_unused`; it does not deactivate or delete the charge. A flagged row becomes subtly muted and gains a neutral “Marked unused” badge plus an `Unflag` action. It deliberately avoids the overspend warning colors.

Verified on September 17, 2026:

- `npm run typecheck` passes.
- `npm run build` passes.
