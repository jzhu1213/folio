# History Search Implementation

## Placement and interaction

- The search field remains at the top of the History screen, directly above the Phase 3.2 collapsible filter bar.
- It now uses the shared `Input` primitive in its search variant, with Lucide search and clear icons. The field has the accessible label `Search transaction merchant or note`; its placeholder is intentionally separate from that label.
- The clear control cancels a pending debounce, clears the query, and returns focus to the Input field.

## Matching, debounce, and filters

- Search is client-side against transactions already fetched into history. The existing memoized search index performs case-insensitive note substring matching (transaction merchant/payee data is stored in the note field) and retains the established additional category, amount, and natural-date matching behavior.
- Input changes are debounced by 150ms. The HistoryScreen pre-warms the search index when transactions change.
- Search results are passed through the existing filter hook, so search and category/date/amount/type/currency filters narrow results together.

## Day groups and empty results

- Search match ranking is used to identify results, then matches are restored to source transaction order before filtering. This keeps Phase 3.1 local-day groups contiguous; groups with no matching transactions are not rendered and visible group subtotals are recalculated from matching rows.
- A minimal accessible placeholder now says `No transactions match your search or filters.` A selected month with no matches gets the equivalent month-specific message. Phase 3.5 remains responsible for final empty/loading-state polish.

## Validation

- `npm run typecheck` — passed
- `npm run test:run -- src/__tests__/history-functional.test.ts` — passed (65 tests)
- `npm run build` — passed
