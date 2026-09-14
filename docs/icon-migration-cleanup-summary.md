# Icon migration cleanup

## Result

The component and app scan began with 54 inline SVG roots. This cleanup migrated all 40 fixed control, status, and navigational glyphs to the shared `Icon.tsx` wrapper. The remaining 14 SVG roots encode data, progress, or illustration geometry and were intentionally preserved.

All migrated icons retain their existing parent interaction and accessible name. `Icon` is decorative by default, matching the existing `aria-hidden` treatment for glyphs inside already-labelled controls. No icon-only control gained or lost an accessible label.

## Registry additions

- `status:complete` → Lucide `Check`
- `status:locked` → Lucide `Lock`
- `status:split` → Lucide `GitFork`
- `action:search` → Lucide `Search`
- `action:download` → Lucide `Download`
- `action:history` → Lucide `History`

## Migrated control-shaped SVGs

### Finance

- `src/components/finance/CompoundGrowthCalculator.tsx`: back chevron → `<Icon name="action:back" size={14} strokeWidth={1.5} />`; portfolio-building glyph → `<Icon name="tool:savings-projections" size={14} strokeWidth={1.5} />`.
- `src/components/finance/CreditPayoffCalculator.tsx`: back chevron → `<Icon name="action:back" size={14} strokeWidth={1.5} />`.
- `src/components/finance/CreditScoreCheckin.tsx`: back chevron → `<Icon name="action:back" size={16} strokeWidth={1.5} />`.
- `src/components/finance/LessonCard.tsx`: back chevron → `<Icon name="action:back" size={16} strokeWidth={1.5} />`.
- `src/components/finance/LessonsScreen.tsx`: learning-path back chevron → `action:back` (16/1.5); recent-lesson chevron → `action:forward` (20/1.5); completed-topic check → `status:complete` (12/3); locked-lesson glyph → `status:locked` (12/2); unlocked-lesson chevron → `action:forward` (14/1.5); tool-card chevron → `action:forward` (16/1.5); credit-check-in chevron → `action:forward` (16/1.5).

### Accounting

- `src/components/accounting/CategoryDetailSheet.tsx`: close glyph → `<Icon name="action:close" size={20} strokeWidth={1.5} />`.
- `src/components/accounting/HistoryView.tsx`: previous-month chevron → `action:back` (16/2); next-month chevron → `action:forward` (16/2).
- `src/components/accounting/TransactionList.tsx`: summary collapse chevron → `action:expand` (12/2); selected-row check → `status:complete` (12/2); split transaction glyph → `status:split` (12/2.5); expanded-row chevron → `action:expand` (14/2); bulk-delete trash → `action:delete` (14/2); bulk-export glyph → `action:download` (14/2).

### History

- `src/components/simplified/HistoryScreen.tsx`: export glyph → `<Icon name="action:download" size={18} strokeWidth={2} />`.
- `src/components/simplified/HistorySearchBar.tsx`: search glyph → `action:search` (18/2); clear-search close glyph → `action:close` (12/2.5); recent-search history glyph → `action:history` (14/2).

### Goals

- `src/components/simplified/GoalContributeSheet.tsx`: sheet close glyph → `<Icon name="action:close" size={16} strokeWidth={2} />`.
- `src/components/simplified/GoalEditSheet.tsx`: sheet close glyph → `action:close` (16/2); linked-account remove glyph → `action:close` (12/2).
- `src/components/simplified/GoalsScreen.tsx`: back chevron → `action:back` (16/2); new-goal plus → `action:add` (16/2).

### Tutorial

- `src/components/simplified/TutorialSteps.tsx`: the three selected-option checkmarks (budget preset, pay cadence, and onboarding choice) → `<Icon name="status:complete" size={12} strokeWidth={2} />`.

### Other fixed controls found by the complete scan

- `src/components/simplified/InvestmentExplorerScreen.tsx`: back chevron → `action:back` (14/1.5).
- `src/components/simplified/BulkRepeatSheet.tsx`: selected-date checkmark → `status:complete` (12/2).
- `src/components/simplified/EducationalMomentCard.tsx`: action arrow → `action:forward` (14/1.5).
- `src/components/simplified/ContextualTipCard.tsx`: dismiss close glyph → `action:close` (14/1.5); action arrow → `action:forward` (14/1.5).
- `src/components/simplified/BudgetSettings.tsx`: back chevron → `action:back` (16/2).
- `src/components/simplified/KeyboardShortcutsHelp.tsx`: close glyph → `action:close` (14/1.5).

## SVGs intentionally left untouched

- `src/components/simplified/TrajectoryScreen.tsx`: dynamically generated projected-score area chart.
- `src/components/simplified/SpendPaceIndicator.tsx`: spending-pace sparkline comparison.
- `src/components/simplified/ConfidenceScreen.tsx`: accessible confidence-score progress ring and score-trend sparkline.
- `src/components/simplified/InvestmentExplorerScreen.tsx`: dynamically generated investment-growth curve.
- `src/components/simplified/CashFlowForecastScreen.tsx`: projected-balance area chart.
- `src/components/simplified/ProgressGarden.tsx`: labelled goal-progress garden illustration.
- `src/components/simplified/DailyAllowanceHero.tsx`: daily allowance sparkline.
- `src/components/simplified/AllowanceRing.tsx`: accessible budget-usage progress ring.
- `src/components/simplified/CelebrationOverlay.tsx`: auto-dismiss countdown progress ring.
- `src/components/simplified/SetupChecklistCard.tsx`: dynamically calculated compact setup progress ring.
- `src/components/simplified/IncomeTrendsScreen.tsx`: labelled monthly income bar chart.
- `src/components/simplified/WishListScreen.tsx`: labelled savings progress ring.
- `src/components/ui/primitives/ProgressRing.tsx`: shared accessible progress-ring primitive.

## Judgment calls

None. The split-transaction glyph in `TransactionList` was treated as a fixed status indicator rather than data visualization; it now uses the closest Lucide equivalent, `GitFork`, through `status:split`.

## Validation

- Re-scan: 14 inline SVG roots remain, all listed above as data visualization, progress geometry, or illustration.
- Flagged finance, accounting, history, goal, and tutorial screens: no inline SVG roots remain.
- `npm run typecheck`: passed. The initial run encountered stale duplicate Next.js generated declarations; `npm run build` regenerated them, and the required follow-up typecheck passed.
- `npm run build`: passed. Next.js compiled, type-checked, generated all static pages, and completed build tracing successfully.
