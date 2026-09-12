# Monthly Runway hero

## Implementation

- Rebuilt `src/components/simplified/DailyAllowanceHero.tsx` in place as the home screen's **Monthly Runway**. Its name is retained as a compatibility boundary for the existing dashboard import; `src/components/RateDisplay.tsx` is an unrelated exchange-rate display.
- Updated `src/components/simplified/HomeScreen.tsx` to pass its already-available transaction list to the hero. No fetching or storage behavior changed.
- Added `monthlyRunwayTransition` to `src/lib/motionPresets.ts`: the established enter curve at the existing `--duration-slow` value (300ms).

## Data and calculation

- The hero includes only current-calendar-month `expense` transactions, using each transaction's effective `date`; income and future-dated expenses are excluded.
- Daily expenses are accumulated through today for the sparkline. The month-end spend projection is the average daily spend so far multiplied by the calendar month's total days.
- Assumption: the existing `dailyBudget` is the available monthly plan baseline, so the remaining projection is `dailyBudget × days in month − projected month-end spend`. This preserves the current home data model without a new budget or account query.

## Experience and accessibility

- The amount counts to its month-to-date total and the sparkline draws from left to right once over 300ms, then remains still. Reduced-motion users receive opacity-only entry and no draw animation.
- The approved tonal terracotta wash remains scoped to this hero through the existing `monthly-runway-hero` surface class.
- The projection is readable text and part of the button's accessible label. The sparkline SVG is decorative and marked `aria-hidden`.

## Validation

- `npm run typecheck` — passed.
- `npm run build` — passed.
