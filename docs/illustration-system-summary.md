# Illustration system

## Component API

The reusable system lives in `src/components/ui/illustrations/Illustration.tsx` and is exported through `src/components/ui/illustrations/index.ts` and `src/components/ui/index.ts`.

```tsx
<Illustration
  name="category:eating-out"
  size={48}
  label="Plate and fork"
/>
```

- `name` is the typed `IllustrationName` union; it accepts only the nine category names in the registry.
- `size` defaults to the 48px artboard. Values below 32px resolve to the supported 32px minimum.
- The SVG is decorative by default (`aria-hidden="true"`). Passing `label` makes it meaningful content with `role="img"` and a unique SVG `<title>` reference.
- `ILLUSTRATION_REGISTRY` is the single, typed source of artwork, mirroring the semantic registry pattern used by `Icon.tsx` without sharing Lucide glyphs or control semantics.

## Shared visual primitives

- A fixed `48 × 48` viewBox and `2px` stroke through `ILLUSTRATION_ARTBOARD` and `ILLUSTRATION_STROKE_WIDTH`.
- Rounded stroke caps and joins on the shared wrapper.
- `var(--text-secondary)` warm-neutral linework and `var(--accent)` terracotta focal fill/stroke; no hardcoded colors.
- Every category uses one central line object, no embedded text, no gradients or glow, and one small terracotta focal fill at most.

## Category illustrations

- `category:dining-hall`: covered tray with a small accent knob.
- `category:eating-out`: plate and fork with a restrained accent centre.
- `category:textbooks`: two stacked books with one bookmark fill.
- `category:rideshare-gas`: car outline with one accent headlamp.
- `category:subscriptions`: subscription card with an accent renewal mark.
- `category:rent-utilities`: house outline with a terracotta door.
- `category:entertainment`: ticket with a single focal mark.
- `category:personal-care`: pump bottle with an accent label dot.
- `category:miscellaneous`: parcel with one terracotta shipping label.

## Review preview

`src/app/illustrations/page.tsx` is a review-only gallery, available locally at `/illustrations`. It renders all nine entries at the default 48px artboard and the 32px minimum side by side. It does not integrate the illustrations into quick-add or any production category picker.

## 32px confirmation

The gallery rendered both 48px and 32px variants for all nine entries. Each variant uses the 48px viewBox, 2px rounded monoline, and no detail smaller than the single accent marker; the focal silhouettes (tray, plate, books, car, card, house, ticket, bottle, and parcel) remain distinct at 32px. No simplification beyond the intentionally sparse shapes was required.

## Validation

- `npm run typecheck`: passed.
- `npm run build`: passed. Next.js compiled, type-checked, generated all static pages (including `/illustrations`), and completed build tracing successfully.
