# Phase 4.5: Insight edge cases and low-data states

## Dashboard states

- **Loading:** The existing `HomeScreenSkeleton` now reserves the same three
  one-column narrative-card slots used by the dashboard insight section. Each slot
  uses the existing `SkeletonCard` and `Skeleton` primitives, so the cards fade in
  without a section-level layout jump.
- **Zero insights:** The insights section uses the established `EmptyState` inside a
  low-elevation `GlassCard`: "Nothing stands out yet" and "Check back once you've
  logged a few more days." The existing `Log an expense` action gives a new user a
  clear next step.
- **One insight:** A single card keeps the same full-width, one-column treatment as
  a multi-card result. It is aligned with the dashboard column rather than centered
  in a multi-column grid, so it reads as one complete decision rather than a missing
  set.
- **Transaction fetch error:** When the transaction source fails, the section shows
  the existing inline `PartialLoadBanner` and its existing retry treatment. The retry
  calls the normal home refresh flow; no new error component or error copy was added.

## Low-data and first-period behavior

The insight engine continues to omit categories that lack a prior comparable period.
On a first week or first month with no account history, no category delta is emitted.
When no independent pace or spike insight qualifies, the dashboard reaches the
intentional zero-insight EmptyState rather than showing a percent based on incomplete
history.

## Tests

Added to `src/lib/insights.test.ts`:

1. A brand-new account with current activity but no prior comparison period returns
   no ranked insights.
2. A category with activity only in the current month returns no category delta and
   is absent from the ranked output.

`npm run test:run -- src/lib/insights.test.ts` passes: **7 tests passed**.

## Verification

`npm run typecheck` and `npm run build` pass after these changes.
