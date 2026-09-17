# Phase 5.1 — Per-Category Budget Limits

- **Data model:** Reused `public.budgets.monthly_limit`. The existing table is already month-scoped and uniquely keyed by user, category, and month, so it preserves the required per-month limit history without a new table.
- **Setting a limit:** The existing **Budget Settings** overlay remains the minimal editing surface. Each category has an inline expandable limit control backed by the existing optimistic `updateBudget` upsert.
- **Live updates:** `CategoryProgress` is driven from the same optimistic `transactions` state passed to the Monthly Runway hero. Current-month category spending is derived directly from that state, so a newly logged expense changes the bar before the asynchronous budget-spend reconciliation completes.
- **No limit:** `CategoryProgress` returns no bar for a zero or absent limit. The category card continues to show its normal spent summary rather than a misleading empty meter.
- **Visual treatment:** A compact, token-only accent bar appears below each limited category in the home spending snapshot. At $0 of $200 it is empty; at $100 it fills halfway; at $190 it is almost full. Values above the cap remain visually capped until the separate overspend-state work is introduced.
- **Verification:** `npm run typecheck`, `npm run test:run -- src/hooks/useHomeData.test.ts`, and `npm run build` pass.
