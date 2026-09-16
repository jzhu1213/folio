# Narrative Insight Card

## Placement and design-system reuse

`src/components/ui/InsightCard.tsx` follows the direct UI-card pattern used by `GlassCard` and `CategoryIcon`: it composes existing primitives rather than introducing a dashboard-specific surface. It is exported from the UI barrel for the Phase 4.4 integration pass. The sentence uses the existing grotesk `cardHeadline` role, while category icon chips and accents come from `CategoryIcon` and `getCategoryAccent`.

## Supporting visual

There was no reusable compact comparison primitive to import. The card uses a hand-built, 48px-tall pair of token-colored bars for category deltas and pace. It accepts exact optional comparison values from a future caller and otherwise uses a relative fallback, so the visual remains a quiet supporting cue. Spike cards show only the outlier amount with the existing warning status icon.

## Preview variants

`/insight-card-preview` is an isolated review route, not linked from the product. It shows:

- Food, up 18%: orange category chip, warning direction marker, and previous/now bars.
- Transportation, down 24%: blue category chip, healthy marker, and lower current bar.
- Fun pace: pink category chip, warning marker, and taller plan/pace bars.
- Drinks spike: purple category chip, warning marker, and a single `$32` emphasis instead of a chart.

Each card is tappable in the preview to review the shared hover/press motion; it does not navigate anywhere.

## Verification

Completed successfully: `npm run typecheck` and `npm run build`.
