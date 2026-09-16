# Phase 4: Consistency and validation pass

## Open-item resolution

- **4.1 period math and low-data thresholds:** Confirmed. Category deltas still
  require two transactions in both equivalent periods; spike detection still needs
  four prior category transactions or active spending days over 28 days. The updated
  regression suite verifies that a brand-new account and a category with current-only
  activity do not produce a ranked delta.
- **4.1 budget-cycle gaps:** Re-confirmed as intentional exclusions. `payday_aligned`
  and `semester` budget lines do not store reliable cycle boundaries, so no
  calendar-month pace insight is created for them. This remains a data-model follow-up,
  not a calculation fallback.
- **4.1 custom categories:** Re-confirmed as a data-model limitation. Custom labels
  currently persist as `other`, so the engine cannot analyze them as distinct
  categories until a durable custom-category id is stored on transactions.
- **4.2 comparison visual:** Re-confirmed as intentionally minimal. The card accepts
  exact comparison values, while the dashboard currently passes the normalized
  ranked `Insight` contract and uses the card's labelled relative fallback. Threading
  exact current/prior values through a presentation adapter is a non-blocking future
  refinement, not a reason to restore a chart-heavy dashboard.
- **4.3 replacement charts:** Resolved. `InsightTrendCard` and
  `InsightBreakdownCard` were removed from History and their unused files deleted.
  `PortfolioAllocationScreen` remains the one simplified-in-place surface; its two
  small allocation visuals retain the Phase 2 palette and the reduced one-takeaway
  treatment.
- **4.4 placement and navigation:** Confirmed in source. Home takes the top three
  ranked results, and a press primes the existing History filter-chip session state
  with the insight category, Expenses, and the existing week/month preset.
- **4.5 non-ideal states:** Confirmed. The home skeleton reserves three insight-card
  slots, zero results use `EmptyState`, transaction-source failure uses the existing
  retry banner, and one card remains full-width in the normal dashboard column.

## Grep audit

- **Chart libraries: pass.** No third-party chart library import is present. The app
  continues to use native SVG/CSS and `ChartFrame`.
- **Expected full-detail charts: pass.** `IncomeTrendsScreen`,
  `CashFlowForecastScreen`, `InvestmentExplorerScreen`, `TrajectoryScreen`,
  `CompoundGrowthCalculator`, `ConfidenceScreen`, and `ActivityHeatmap` remain
  intentionally navigated views whose visual detail is their primary task.
- **Expected supporting visuals: pass.** The Monthly Runway sparkline,
  `SpendPaceIndicator`, `AllowanceRing`, and goal/progress rings remain compact,
  single-question cues rather than dashboard statistic panels.
- **Previously unnamed candidates: reviewed.** `CategorySpendingBar` is a six-pixel,
  interactive category summary inside History, not a standalone analytics card.
  `StreakDetailView`'s 30-day calendar heatmap belongs to its dedicated streak
  overlay. `ProgressGarden` is decorative, and the wish-list/checklist rings are
  direct threshold controls. They are intentionally retained and are not Phase 4
  dashboard clutter.
- **Removed replacement components: pass.** No source import or render remains for
  `InsightTrendCard` or `InsightBreakdownCard`.
- **Insight category mapping: pass.** `InsightCard` uses `CategoryIcon` and
  `getCategoryAccent`; `insights.ts` resolves labels from `BUDGET_CATEGORIES`.
  The insight engine, card, and preview contain no hardcoded hex/rgb/hsl category
  colors.
- **Fraunces audit: pass.** `InsightCard` and its helper subcomponents contain no
  Fraunces use. The preview page uses the established display font only for its
  preview page title, not card content.

## Walkthrough results

1. **Populated dashboard:** Source wiring and the isolated preview's server-rendered
   markup confirm the expected card sentence, category icon, supporting bars, and
   accessible labels. A live populated-account walk-through could not be completed:
   no test-account fixture is configured locally, and both available local browser
   renderers showed a blank client surface even though the development server returned
   the expected HTML.
2. **Card to filtered History:** Source verification confirms the press invokes
   `primeHistoryFilters` before History navigation and uses the existing category,
   Expenses, and week/month chips. Live tap verification is pending the same local
   test-account/browser-renderer issue.
3. **Near-empty account:** The engine tests pass for no prior comparison data, and
   the dashboard's zero-result branch renders the composed `EmptyState` instead of a
   vacant grid. Live rendering is pending the local fixture issue above.
4. **Transaction fetch error:** The dashboard receives
   `loadError || failedSources.includes('transactions')` and renders the established
   `PartialLoadBanner`, whose retry invokes the normal refresh flow. Live network
   fault injection is pending a usable local browser surface.

## Theme and accessibility

The source-token check passes in both themes: sentence text uses `--text`, labels use
`--muted`, state indicators use `--warning`/`--success`, and the reference bar uses
`--border-strong-color`; each variable is redefined by the warm light theme. Category
bars continue to come from the shared Phase 2 mapping and now have a
`--border-strong-color` outline, keeping the small visual discernible on either
surface without replacing its category color.

`InsightCard` now enforces a 44px minimum interactive target, retains the shared
`focus-ring`, and exposes an accessible button label containing both the complete
sentence and a textual direction (for example, "Spending is up"). Its automated axe
test passes.

## Verification

`npm run test:run -- src/components/ui/InsightCard.test.tsx src/lib/insights.test.ts`
passes with **8 tests**. `npm run typecheck` and `npm run build` pass.

## Final grade

**A- for the Phase 4 goal.** The dashboard now leads with at most three readable,
decision-relevant sentences instead of standalone trend and breakdown cards, while
full-detail visuals remain only in intentionally navigated tools. The scoped follow-
ups are durable custom-category ids, real cycle boundaries for payday/semester
budgets, optional exact comparison values for the already-minimal bars, and a local
populated-account/browser fixture to complete the live four-step walkthrough.
