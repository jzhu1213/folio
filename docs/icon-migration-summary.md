# Icon Migration Summary

## Source and scope

`lucide-react` (v1.28.0) was already the installed source for the central
`src/lib/icons.ts` registry and `Icon` wrapper. This pass removed the remaining
inline UI glyphs in the shared banners, toast, profile sheet, and profile page;
no second icon package was added. Inline SVGs retained elsewhere are charts,
progress indicators, celebratory illustration, or data visualization—not UI
icons—and were deliberately left outside the icon system.

Stored emoji remains supported as user/content data (for example custom
category data and celebratory copy), but `CategoryIcon` always renders a Lucide
glyph.

## Lucide names added in this pass

- `X` (`action:close`)
- `ChevronLeft` (`action:back`)
- `Sun` (`chrome:sun`)
- `Moon` (`chrome:moon`)

The pre-existing registry continues to provide the category, status, tool,
navigation, toast, and shared-page names in `src/lib/icons.ts`; its `IconName`
union remains the compile-time allowlist and keeps imports tree-shakeable.

## Files changed

- `src/styles/tokens.ts`
- `src/lib/icons.ts`
- `src/components/ui/Icon.tsx`
- `src/components/ui/CategoryIcon.tsx`
- `src/components/ui/OfflineBanner.tsx`
- `src/components/ui/PartialLoadBanner.tsx`
- `src/components/ui/ServiceWorkerUpdatePrompt.tsx`
- `src/components/ui/Toast.tsx`
- `src/components/ui/ProfileSheet.tsx`
- `src/components/ui/AppShell.tsx`
- `src/components/ui/composed/QuickLogControl.tsx`
- `src/components/simplified/SyncIndicator.tsx`
- `src/components/simplified/SwipeableTransactionRow.tsx`
- `src/app/profile/page.tsx`

## Accessibility

The icon-only dismiss buttons in the offline banner, toast, and profile sheet
already had accessible labels; their replacement icons stay decorative. The
profile-page Dark Mode toggle was missing an accessible label and now has
`aria-label="Toggle dark mode"`.
