# Phase 2 final consistency and validation

## Consolidated follow-up list

- Phase 2.1 had no unresolved judgment calls. Its split-transaction status glyph remains the established `status:split` Lucide mapping.
- Phase 2.3's temporary category placeholder was resolved by the Phase 2.4 horizontal illustrated row; the former grid remains only as an explicitly hidden transition reference and has no rendered, focusable, or accessible path.
- Phase 2.4's Drinks and Health fallback mappings remain intentionally `category:miscellaneous`; Phase 2.2 has no dedicated art for either. Custom categories now use their user-selected registry illustration, with miscellaneous as the documented default.
- Phase 2.5's palette discrepancy is resolved. The unchanged curated swatches now have one canonical source, `categoryPalette` in `src/styles/chartTokens.ts`; `CATEGORY_ACCENTS` is a compatibility alias. Category management consumes `categoryPalette` directly.
- Phase 2.6's monthly-only recurrence is the correct behavior for the existing `FixedExpense` model, which has no frequency field. Its current-month-through-today backfill limit remains intentional.
- Phase 2.7 found category budget data already exists, so category remaining is preferred with Monthly Runway as the fallback. No budget model was added.

## Consistency fixes in this pass

- Removed the second rendered legacy date picker from quick-add. `DatePickerChips` is now the sole date-control path.
- Added the standard `focus-ring interactive-control` states to every date-picker button.
- Made programmatic category scrolling use instant positioning when reduced motion is requested.
- Replaced the generic external quick-capture and suggested-entry confirmations with the same isolated Monthly Runway confirmation formatter used by quick-add.
- Corrected quick-add's date handling to use `formatDateLocal` end to end. This fixes a late-evening UTC mismatch that could otherwise treat a same-day entry as tomorrow in the Monthly Runway calculation.

## End-to-end walkthrough

Production-build validation used a clean local browser profile.

- Same-day, non-recurring: entered `$12.50`, selected Food, and saved with keyboard. The toast read: `Logged $12.50 to Food. $1,471.15 left this month.`
- Backfilled: selected Last Friday, entered `$7.25`, selected Drinks, and saved with keyboard. The toast used the selected effective date and showed the updated Monthly Runway remaining amount.
- Recurring: entered `$30`, selected Rent & Bills, enabled `This expense repeats · monthly`, and saved. The toggle exposed `aria-pressed="true"`; the existing Recurring Bills screen then listed one active `$30/mo` Rent & Bills entry with the selected due day.
- Custom category: the live unauthenticated harness cannot persist a Supabase custom category, so the final save cannot complete there. The management screen, constrained color picker, typed illustration picker, and shared data path were verified; focused tests confirm that an active custom category reaches quick-add with its illustration/color and that archive removes it only from active selection while retaining its record.

## Audit findings

- Generic normal-save toast scan: resolved. The only remaining `Saved offline — will sync when connected` messages are intentional sync-status copy, not successful-save confirmations.
- Old category picker: no active use. The illustrated horizontal row is the only rendered picker; its tile subtree contains no Lucide `Icon` components.
- Illustration use: quick-add tiles are decorative illustrations. The review gallery and the Phase 2.5 category-management illustration chooser are intentional supporting uses required to review/select the curated set; neither mixes Lucide with a quick-add tile.
- Category colors: category management now consumes the centralized `chartTokens.ts` palette; no freeform or hardcoded swatches remain in that flow.
- Interactive states: quick-add tiles, recurring toggle, date controls, category-management actions, swatches, and illustration choices use the established focus/interactive classes or native button semantics. Arrow keys, Home/End, Enter, and Space remain supported for category selection.

## Theme and motion parity

Illustrations use only `var(--text-secondary)` and `var(--accent)`. Selected tiles use `var(--accent-muted)`, `var(--accent)`, and surface/border tokens. Both light and dark token blocks define those variables, so the new art and selected state switch with the theme rather than relying on fixed colors.

`BottomSheet` uses `slideUpSheet` and switches to `reducedFade`; `Toast` similarly switches from `toastSlide` to `reducedFade`. The category row now avoids smooth programmatic and CSS scrolling under reduced motion, while the date-picker disclosure already uses opacity-only reduced-motion variants.

## Final assessment

Phase 2 meets its goal. Logging is a continuous amount → category → optional date/recurrence → save flow, category art stays warm and sparse rather than icon-like, and confirmations explicitly return each entry to the month's remaining runway. Custom-category creation is constrained to curated art and chart colors; archive is non-destructive and permanent delete is not offered.

No human design decisions remain open. The only validation limitation was the local browser profile's lack of an authenticated Supabase user for persisting a test custom category.

## Validation

- `npm run typecheck` — passed.
- `npm run build` — passed.
- `npm run test:run -- src/lib/confirmationFeedback.test.ts src/lib/customCategories.test.ts` — passed (5 tests).
- `git diff --check` — passed.
