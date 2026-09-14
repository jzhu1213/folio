# History List Restructure

## Implemented

- The live transaction history renderer (`HistoryScreen` → `HistoryView` → `TransactionList`) now groups consecutive, already-sorted transactions into local-calendar-day groups without changing fetching, ordering, or pagination.
- Each group presents a flat, token-based surface with a day heading and right-aligned daily spend subtotal. Income remains visible as the existing separate daily income figure.
- Day labels are `Today`, `Yesterday`, or a weekday plus short month and day (for example, `Monday, Sep 8`). The label uses the section-headline role; totals use the data-table-figure role with tabular numerals.
- Transaction content is rendered through the shared `ListRow` primitive inside every group. Its keyboard activation, hover, active, and focus-visible behavior remain available; the primitive now also exposes `aria-expanded` for the history row's expandable actions.

## Local-date correctness and performance

- Group keys normalize each transaction's date through `parseDateLocal` and `formatDateLocal`, avoiding UTC conversion at day boundaries. Week keys and month summary keys use the same local-date path.
- Grouping is memoized and linear in the filtered transaction count. The existing CSS content-visibility virtualization remains on every day group, so group headers and their rows stay together when off-screen rendering is deferred.

## Deferred to later Phase 3 work

- Filter chips and view-toggle controls (Phase 3.2)
- Search controls and behavior (Phase 3.3)
- Transaction detail/edit sheet (Phase 3.4)
- Dedicated empty and loading-state polish (Phase 3.5)

## Validation

- `npm run typecheck` — passed
- `npm run build` — passed
