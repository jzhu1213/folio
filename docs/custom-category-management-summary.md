# Custom category management summary

## Data support

Custom category create, fetch, update, and permanent-delete helpers already existed in `src/lib/customCategories.ts`, together with `useCustomCategories`. Persistent archiving did not exist, so Phase 2.5 adds it as a new soft-delete capability:

- `archived`, `color`, and `illustration` metadata were added to the `CustomCategory` domain type and shared update path.
- [`0007_custom_category_management.sql`](../supabase/migrations/0007_custom_category_management.sql) adds the three non-destructive columns to `custom_categories`.
- Active category merging now excludes archived custom categories, while the hook continues to retain their records for management and restore.
- No transaction rows are deleted or edited by archive. The current transaction model stores custom categories as the pre-existing `other` accounting value, so historical transaction amounts remain untouched; archived category records remain visible in the management screen for restoration.

## Management screen

[`CategoryManagementScreen.tsx`](../src/components/simplified/CategoryManagementScreen.tsx) is the dedicated screen opened from the existing Category Hub route. It uses `ListRow` for custom category entries and the composed `EmptyState` when none have been created.

Each row shows a Phase 2.2 illustration, category name, persisted color swatch, and Edit/Archive controls. Editing exposes an accessible name field, curated color-swatches, and illustration picker. Archived entries remain visible in a separate section with a Restore action; permanent deletion is deliberately not offered.

## Picker constraints

- The illustration picker is limited to the existing typed Phase 2.2 illustration registry, defaulting to `category:miscellaneous`.
- The color picker is a fixed set of the existing bright category/data-visualization swatches (`CATEGORY_ACCENTS`), with no freeform or hex entry. The requested `chartTokens.ts` category palette is not present in the current source file; `CATEGORY_ACCENTS` is the existing curated category palette used by the app’s data-visualization surfaces, so it is consumed without changing `chartTokens.ts`.
- Swatches and illustration options are native buttons with accessible names, `aria-pressed`, visible focus treatment, and keyboard activation.

## Shared updates

Quick-add continues to consume `mergeCategories(customCategories)`. It now omits archived custom categories and reads a custom category’s selected illustration and color directly from the shared display item, so creation, rename, recolor, and archive updates appear without a separate picker data path.

## Validation

- `npm run typecheck` — passed.
- `npm run build` — passed.
- `git diff --check` — passed.
