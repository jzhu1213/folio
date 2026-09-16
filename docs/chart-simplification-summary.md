# Phase 4.3 chart simplification audit

The audit covered chart-library imports plus every chart-like SVG, bar, ring, heatmap, and `ChartFrame` surface under `src/components` and `src/app`. Folio has no third-party chart library; all visuals are native SVG/CSS and shared `ChartFrame` composition. Decorative illustrations, celebration art, and ordinary progress controls were not counted as analytical charts.

| Surface | Bucket | Decision |
| --- | --- | --- |
| `ChartFrame` | Keep as is | Shared structural shell already supplies tokenized surface, loading, error, and accessible figure states. |
| `DailyAllowanceHero` Monthly Runway sparkline | Keep as is | It is a deliberately small supporting visual for the primary runway decision; dashboard composition is out of scope. |
| `SpendPaceIndicator` | Keep as is | Already a 28px, two-line supporting pace cue with no axes or legend. |
| `AllowanceRing` | Keep as is | A direct daily-allowance progress signal, not an analytics chart. |
| `InsightTrendCard` | Replace with insight card | Its month-over-month trend and category mover copy overlap with the Phase 4.1/4.2 insight flow. |
| `InsightBreakdownCard` | Replace with insight card | Its top-expense/category summary is a dashboard statistics dump better reduced to ranked narratives. |
| `IncomeTrendsScreen` / `IncomeBarChart` | Keep as is | Dedicated, intentionally navigated six-month income history needs period-by-period detail. |
| `CashFlowForecastScreen` balance curve | Keep as is | The forecast line and event list answer a forward cash-position question that a single card cannot replace. |
| `PortfolioAllocationScreen` allocation-by-type bar | Simplify in place | Consolidated six account-type colors to four existing Phase 2 category-palette colors; exact types remain in the rows. |
| `PortfolioAllocationScreen` growth-vs-contributions split | Simplify in place | Reduced duplicate tiles plus bar to one labeled split bar with one composition takeaway. |
| `CompoundGrowthCalculator` yearly bars | Keep as is | Calculator users need the visible year-by-year result of their inputs. |
| `InvestmentExplorerScreen` growth curve | Keep as is | The interactive what-if curve is the tool’s essential output. |
| `TrajectoryScreen` 12-month progress curve | Keep as is | It preserves a longitudinal savings-and-debt projection with endpoints and explanatory detail. |
| `ActivityHeatmap` | Keep as is | The dedicated activity view requires time-by-day density and its legend for exploration. |
| `ConfidenceScreen` score ring, sparkline, and factor bars | Keep as is | These are the purpose of a dedicated diagnostic screen, not dashboard statistics. |
| `SavingsProjection` Roth IRA progress bar | Keep as is | A threshold progress indicator directly answers contribution-limit status. |

## Changed visuals

`PortfolioAllocationScreen` now uses a four-color subset of the existing category palette: cash accounts share green, retirement accounts share lavender, brokerage is blue, and “other” is neutral. This removes decorative color distinction while retaining readable type labels.

Its growth-vs-contributions section previously combined two inset metric tiles, emoji labels, and a split bar. It now has one 10px split bar followed by exact contributed and growth labels in the existing body typography. The card remains the same shared `ChartFrame` surface, with no data or prop-interface changes.

## Phase 4.4 replacement resolution

- `src/components/simplified/InsightTrendCard.tsx`
- `src/components/simplified/InsightBreakdownCard.tsx`

Both were removed from History and their unused component files were deleted in Phase 4.4 after the wired `InsightCard` flow covered the same information.

## Verification

Completed successfully: `npm run typecheck` and `npm run build`.
