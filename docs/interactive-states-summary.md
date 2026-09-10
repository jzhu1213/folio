# Interactive States Summary

## Inventory

Reviewed every file in `src/components/ui/primitives`: `Badge`, `Button`,
`Card`, `ChartFrame`, `Chip`, `EmptyState`, `ErrorState`, `IconButton`,
`Input`, `ListRow`, `NumericInput`, `OverlayScreen`, `ProgressRing`,
`SectionHeader`, `SegmentedControl`, `Select`, `Sheet`, `Skeleton`, and
`Toggle`; plus `SettingsToggle`, `SettingsRow`, and `DatePickerChips`.

Interactive primitives are `Button`, interactive `Card`, retry controls in
`ChartFrame`/`ErrorState`, `Chip`, `IconButton`, `Input`, `ListRow`,
`NumericInput`, `SegmentedControl`, `Select`, `Toggle`, `SettingsToggle`, and
`DatePickerChips`. `SettingsRow` is layout-only. `Badge`, `ProgressRing`,
`Skeleton`, `SectionHeader`, `OverlayScreen`, and `Sheet` are display,
progress, or overlay primitives rather than standalone controls. `EmptyState`
contains an optional action button and is included through that button.

The standalone button-like components found outside primitives are local,
feature-specific controls (including `LessonCard`, `AppLockSetting`,
`HistoryFilterChips`, `HistoryViewToggle`, `QuickLogArea`, `SettingsSubScreen`,
and `SyncIndicator`). They were inventoried but not restyled here because this
phase establishes the shared primitive treatment first; their local visual
migration is a follow-up application task.

## Changes

- Added the shared `interactive-control` state treatment in `globals.css`:
  default transition; pointer-only hover lift and shadow; `:active` 0.98
  scale; existing `focus-ring` focus-visible outline; and tokenized disabled
  opacity/cursor.
- Added `interactive-field` for text and numeric fields: tokenized transition,
  pointer-only border feedback, and the existing focus-visible ring.
- Added the same state treatment to DatePickerChips without changing its
  layout.
- `Button`, `Chip`, `IconButton`, `SettingsToggle`, `Toggle`, `Select`,
  `SegmentedControl`, `Input`, and `NumericInput` now use the shared state
  classes. Existing default and disabled states were retained; disabled opacity
  now references `--opacity-40`.
- Interactive `Card`, both interactive `ListRow` paths, EmptyState actions,
  ErrorState retry, and ChartFrame retry now use the shared control class.
- Added keyboard activation to the swipeable ListRow path and Select option
  rows. Native buttons remain natively keyboard-operable.

## Files touched

- `src/app/globals.css`
- `src/components/ui/primitives/Button.tsx`
- `src/components/ui/primitives/Card.tsx`
- `src/components/ui/primitives/ChartFrame.tsx`
- `src/components/ui/primitives/Chip.tsx`
- `src/components/ui/primitives/EmptyState.tsx`
- `src/components/ui/primitives/ErrorState.tsx`
- `src/components/ui/primitives/IconButton.tsx`
- `src/components/ui/primitives/Input.tsx`
- `src/components/ui/primitives/ListRow.tsx`
- `src/components/ui/primitives/NumericInput.tsx`
- `src/components/ui/primitives/SegmentedControl.tsx`
- `src/components/ui/primitives/Select.tsx`
- `src/components/ui/primitives/Toggle.tsx`
- `src/components/ui/DatePickerChips.tsx`
- `src/components/ui/SettingsToggle.tsx`

## Token gaps

None. Hover/press feedback uses `--duration-fast` and `--ease-enter`; focus
uses the existing focus-ring variables; disabled state uses `--opacity-40`.
