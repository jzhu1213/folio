# Phase 4.4: Insight surfacing and placement

## Placement

The dashboard now shows up to three ranked insight cards directly below the Monthly
Runway hero in `HomeScreen`. This keeps the most actionable spending signals near the
runway decision they support, without adding another destination or crowding the
home screen with all four possible insights.

The section uses the insight engine's ranked results and a normal one-column grid, so
one or two qualifying cards keep their natural spacing. When no insight qualifies,
the section shows a single, low-emphasis message: "Keep logging and we'll surface
useful spending patterns here."

## Replaced charts

The two Phase 4.3 replacement candidates were removed from History:

| Removed component | Former screen | Replacement |
| --- | --- | --- |
| `InsightTrendCard` | History | Dashboard insight cards |
| `InsightBreakdownCard` | History | Dashboard insight cards |

Both legacy component files were deleted after their only History usages and imports
were removed. No Phase 4.3 replacement candidate was skipped. Simplified-in-place and
keep-as-is chart work was left untouched.

## History navigation

`InsightCard` presses use the existing History filter-chip state rather than adding a
new route or filtering format. Before switching to History, the dashboard primes the
existing `folio-history-screen-filters` session value with the insight category,
expense type, and the existing date-range preset:

- category delta: `this_week`
- pace and spike: `this_month`

`HistoryScreen` already restores that persisted state into its existing chips, so the
destination shows the requested category and period without a parallel navigation
mechanism.

## Verification and manual walkthrough

`npm run build` and `npm run typecheck` pass after the change.

Manual walkthrough: load the dashboard with qualifying transaction history, confirm
one to three cards appear beneath Monthly Runway, then tap a card. History should
open with its category, Expenses, and the matching week/month preset already applied.
With sparse or brand-new account data, confirm the single neutral placeholder appears
instead of an empty card area.
