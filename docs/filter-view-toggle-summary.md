# Filter Chips and View Toggle Redesign

## Preserved options

- Filter dimensions: multi-select category, date range (Today, This week, This month, Last month, custom), amount range (Under $10, $10–50, $50–100, Over $100, custom), transaction type (All, Expenses, Income, Refunds), and currency when multiple currencies are present.
- View modes: Timeline, By Category, and By Merchant.
- No filter dimensions or view modes were removed or proposed for removal.

## Implemented behavior

- The filter bar is collapsed by default. Its 44px filter trigger remains visible, and reports `All transactions` or a compact active-filter summary plus a count badge. Selecting it expands the complete, existing filter controls with the shared snappy motion token.
- Chips, custom-range inputs, the clear action, and view-mode buttons now use the flat surface, border, radius, and label/button typography tokens. All interactive controls use the shared `focus-ring` and `interactive-control` states; inputs use the matching `interactive-field` state.
- The active view uses the accent-muted surface and accent border. The selected button uses token-based layout motion, while HistoryScreen retains its existing animated view transition.

## Accessibility and regrouping

- The filter disclosure button exposes `aria-expanded` and `aria-controls`. Filter rows retain named toolbars, roving arrow/Home/End keyboard navigation, and native Enter/Space activation. The view-mode group retains roving arrow/Home/End navigation and communicates its selected mode through `aria-pressed`.
- Filtering still happens in `HistoryScreen` before its results reach the Phase 3.1 `TransactionList`. That list groups the filtered transaction sequence by local calendar day, so filter changes re-group the resulting list rather than filtering only already-rendered groups.

## Validation

- `npm run typecheck` — passed
- `npm run test:run -- src/__tests__/history-functional.test.ts` — passed (65 tests)
- `npm run build` — passed
