# Typography system rebuild

## Font loading

`src/app/layout.tsx` now loads DM Sans and Fraunces with `next/font/google`.
The generated variables are bridged in `src/app/globals.css` as:

- `--font-body`: DM Sans, with `Arial, sans-serif` as the fallback.
- `--font-display`: Fraunces, with `Georgia, serif` as the fallback.

`src/styles/tokens.ts` remains the Tailwind source: `font-sans` resolves to
`--font-body` and the new `font-display` family resolves to `--font-display`.
The external Inter stylesheet, layout `<link>`, direct CSS declarations, and
remaining runtime references were removed. Canvas-generated images now request
DM Sans with Arial fallback. The property-test fixtures now model Fraunces for
display roles and DM Sans for interface roles.

## Final role scale

- `monthlyRunwayNumber`: Fraunces, 48px / 50px, 600, tabular figures.
- `screenTitle`: Fraunces, 30px / 34px, 600.
- `sectionHeadline`: Fraunces, 22px / 28px, 550.
- `cardHeadline`: DM Sans, 16px / 22px, 600.
- `body`: DM Sans, 15px / 22px, 400.
- `labelButton`: DM Sans, 13px / 18px, 600.
- `caption`: DM Sans, 12px / 16px, 500.
- `dataTableFigure`: DM Sans, 14px / 20px, 600, tabular figures.

`src/styles/typography.ts` exports these as the typed `typographyRoles` map.
The former 10-tier `typography` object remains as a compatibility map whose
entries only resolve to one of the approved roles; it contains no retired size
or font values.

## Legacy API decisions

- Removed: `expressiveDisplay` and `typeStyle`; neither had a consumer and the
  role map supersedes them.
- Retained: `ROOT_FONT_SIZE_PX` and `pxToRem`, because the error boundary and
  shared compatibility code still use the conversion API.
- Retained and repurposed: `FONT_WEIGHT_TRANSITION_MS`,
  `FONT_WEIGHT_TRANSITION_EASING`, `fontWeightTransition`, and
  `animatedFontWeight`. `DailyAllowanceHero` still consumes the last helper;
  its existing timing remains unchanged in this typography-only phase.
- Retained: `FONT_FAMILY` as a deprecated body-font compatibility alias so
  existing screens migrate safely over later phases.

## Shared components updated

- `SectionHeader` now consumes `typographyRoles.sectionHeadline` directly.
- Primitive `EmptyState` and `ErrorState` titles now consume
  `typographyRoles.cardHeadline` directly.
- Direct Inter declarations required for removal were changed to the body-font
  variable in `HistoryView`, `InlineTransactionEditor`, and
  `DailyAllowanceHero` without changing their sizing or layout.

## Deferred hardcoded heading, title, and hero-number usage

These remain intentionally untouched for the later feature-screen and
consistency passes. They bypass a role object with local size and/or weight
overrides, or use legacy compatibility aliases on a title/hero element.

- `src/components/ErrorBoundary.tsx:92-97` — local error heading size/weight.
- `src/components/finance/CreditPayoffCalculator.tsx:128` — 28px screen title.
- `src/components/finance/CompoundGrowthCalculator.tsx:110,270` — 28px title
  and 40px result figure.
- `src/components/finance/CreditScoreCheckin.tsx:100,115` — legacy heading
  alias and 48px score figure.
- `src/components/finance/LessonsScreen.tsx:233,312` — legacy card title and
  36px progress figure.
- `src/components/finance/LessonCard.tsx:119,249` — legacy heading aliases.
- `src/components/simplified/InvestmentExplorerScreen.tsx:127,252` — 28px
  title and 36px projected-value figure.
- `src/components/simplified/GoalContributeSheet.tsx:147-155` — 17px heading.
- `src/components/simplified/TrajectoryScreen.tsx:260,283-289` — 48px figure
  and legacy heading alias.
- `src/components/simplified/DebtScreen.tsx:231-246` and
  `src/components/simplified/YearInReviewScreen.tsx:197,221` — legacy screen
  and section heading aliases.
- `src/components/simplified/OnboardingTutorial.tsx:178,186-195,588-605` and
  `src/components/simplified/TutorialSteps.tsx:407,627,691,889,4255` — local
  onboarding title/hero sizing.
- `src/components/simplified/IncomeSheet.tsx:410-412`,
  `src/components/simplified/TravelModeSheet.tsx:186,303`,
  `src/components/simplified/SharingScreen.tsx:181-189`,
  `src/components/simplified/GoalEditSheet.tsx:180`, and
  `src/components/simplified/SharedGoalSheet.tsx:247` — feature-local sheet
  and card heading styling.
- `src/components/ui/composed/TransactionFeedback.tsx:296-302` and
  `src/components/ui/composed/LoggingSheet.tsx:463-489` — composed feedback
  title/figure styling.

## Validation

- `npm run typecheck` — passed.
- `npm run build` — passed with normal network access. The first sandboxed
  attempt could not resolve `fonts.googleapis.com`; this was the known sandbox
  DNS limitation. The normal-network build fetched both `next/font` families,
  compiled, type-checked, and generated all static routes successfully.
