# Category selection redesign summary

## Final picker structure

The active picker is in [`src/components/simplified/ExpenseSheet.tsx`](../src/components/simplified/ExpenseSheet.tsx), directly below the amount field. It is a single native horizontal scrolling row, not a grid or a dropdown:

- The row is a labeled category group with native buttons, `overflow-x: auto`, touch panning, smooth scrolling, scroll snap, and inset padding so a tile’s border and focus ring are not clipped at either edge.
- Each 104px tile contains a decorative 48px [`Illustration`](../src/components/ui/illustrations/Illustration.tsx) and its existing category label using the shared DM Sans `labelButton` role (13px/18px/600).
- Tile buttons use `interactive-control` and `focus-ring`. The category row itself contains no Lucide icons.
- The optional tracker-mode “General” choice uses the miscellaneous illustration and preserves the pre-existing no-category behavior.

The temporary select and Phase 2.4 placeholder text are removed from the rendered flow. The older grid remains non-rendered transition reference only; it is not part of the accessible or interactive quick-add UI.

## Category-to-illustration mapping

The picker reads the existing `mergeCategories(customCategories)` display data and uses this typed mapping:

- Food → `category:eating-out`
- Rent & Bills → `category:rent-utilities`
- Transportation → `category:rideshare-gas`
- School → `category:textbooks`
- Fun → `category:entertainment`
- Subscriptions → `category:subscriptions`
- Other → `category:miscellaneous`
- Drinks → `category:miscellaneous` fallback (no dedicated drinks illustration)
- Health → `category:miscellaneous` fallback (no dedicated health illustration)
- Custom categories → `category:miscellaneous` fallback until Phase 2.5 defines custom-art choices

The full transaction-category mapping also defensively sends income and gig values to `category:miscellaneous`; those values are not shown by the expense picker’s current `BUDGET_CATEGORIES` data source. The Phase 2.2 dining-hall and personal-care illustrations remain available in the registry for later matching categories, but no current quick-add category maps to them.

## Interaction and selection behavior

- Pointer and touch: each native button is directly tappable; the row has native horizontal overflow and `touch-action: pan-x` for drag/trackpad scrolling.
- Keyboard: Tab reaches tiles; Left/Right arrows move focus through the row (with Home/End support), and native Enter/Space selects the focused tile.
- Programmatic defaults, auto-categorization, and user selection update the selected tile key and call `scrollIntoView`, keeping the active tile visible.
- Selected tiles expose `aria-pressed="true"` and use a high-contrast terracotta treatment: `2px solid var(--accent)`, `var(--accent-muted)` fill, and a restrained directional shadow. Unselected tiles use the raised surface with the default border.

## Save-path confirmation

Selection updates the same `category` state used by the pre-existing `handleSubmit` implementation; no category model or persistence code changed. Browser validation entered `12.50`, selected a category with the keyboard, and confirmed that the existing “Log expense” action became enabled. The unchanged submit handler supplies that selected category and amount to the existing `onSubmit` data path.

## Validation

- `npm run typecheck` — passed.
- `npm run build` — passed.
- Browser check — passed: nine current expense-category tiles rendered with 48px `0 0 48 48` illustration art and no Lucide glyphs; the row reported native horizontal auto-scroll, smooth scrolling, and scroll snap. Selecting Food then ArrowRight moved focus to Drinks; Space selected Drinks (`aria-pressed="true"`). The selected tile resolved to the terracotta muted fill with a 2px terracotta border, and a valid amount plus selected category enabled the existing save action.
