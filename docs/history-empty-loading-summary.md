# Phase 3.5 — History Empty and Loading States

## EmptyState composition

`EmptyState` already accepted a custom `ReactNode` illustration as well as its named Lucide-icon variants, so no parallel empty-state component was added. Its title, body, and action now apply the established card-headline, body, and label/button typography roles.

## True empty state

- When there are no transactions and no active criteria, History shows the new hand-drawn `empty:history-ledger` illustration: an open ledger with one terracotta coin focal point.
- Copy: **“Your history starts here”** and **“Log a first transaction and your spending story will begin to take shape.”**
- The primary action, **“Log your first expense,”** routes to the existing quick-add expense flow.
- This is also used for a selected month with no transactions when no search or filters are active.

## Filtered or searched empty state

- When existing transactions are omitted by a search, filter, or date-range criterion, History uses the lightweight Lucide filter variant only—never the hand-drawn illustration.
- Copy: **“No matches found”** with either **“Try a different search or clear your filters to see your transactions.”** or the selected-month equivalent.
- **“Clear search and filters”** clears the debounced search value and all filter criteria together.

## Grouped loading skeleton

- `HistoryGroupedSkeleton` extends the existing `SkeletonRow` module. It renders two flat day groups, each with a skeleton day-label/subtotal header and plausible rows beneath it.
- It reuses `Skeleton`/`SkeletonRow`, token-based flat surfaces and borders, and the global shimmer timing. The existing `prefers-reduced-motion` CSS swaps the shimmer sweep for a calm opacity pulse.

## Motion and accessibility

- Empty states use the composed `EmptyState` `fadeScaleIn` entrance (or `reducedFade`), while the grouped skeleton uses the same token-derived variants and exits through the surrounding `AnimatePresence`.
- Reduced motion is opacity-only for entrances and the skeleton pulse; no new ad hoc animation was added. Status messaging and all calls to action remain keyboard accessible.

## Validation

- `npm run typecheck` — passed.
- `npm run build` — passed.
