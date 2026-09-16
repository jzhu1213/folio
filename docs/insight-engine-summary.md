# Insight engine data layer

## Date and pace logic

`src/lib/insights.ts` mirrors the Monthly Runway calculation for each budget category: it builds cumulative spend from effective transaction dates, divides it by days elapsed for daily pace, and projects that pace across the calendar month. It reuses the project's local-calendar helpers and existing weekly-budget-to-monthly-equivalent utility. New comparison logic aligns week-to-date with the same weekdays one week earlier, and month-to-date with the same numbered days in the prior month.

## Tunable thresholds

- A category delta needs at least 2 expense transactions in both the current and prior comparison windows. This prevents one-off purchases from producing a headline percentage.
- Spike detection uses the preceding 28 days, needs at least 4 prior category transactions (or 4 prior active spending days), and flags spend strictly greater than 2 times that average. This keeps the card focused on genuinely unusual activity.
- Ranking returns at most 4 cards: projected-above-plan pace first, then the largest category deltas, then spikes.

## Data gaps

The current `Budget` model has a calendar `month` and supports monthly and weekly limits, which is enough for calendar-month pace. `payday_aligned` and `semester` budgets do not include actual cycle start/end dates, so the engine deliberately excludes those budget lines from month-end pace insights rather than comparing incompatible periods. Category labels come from the existing `BUDGET_CATEGORIES` source; custom categories are currently persisted as `other`, so they cannot be separately analyzed until the transaction model retains a custom category id.

## Verification

Completed successfully: `npm run test:run -- src/lib/insights.test.ts` (5 tests passed), `npm run typecheck`, and `npm run build`. The insight test file covers normal delta calculation, spike detection, low-data exclusion, pace projection, and ranking/trimming.
