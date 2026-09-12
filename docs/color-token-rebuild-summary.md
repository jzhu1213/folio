# Color token rebuild summary

## Token source and theme mapping

`src/styles/tokens.ts` remains the sole TypeScript source of truth. It now declares `colors.light` and `colors.dark`; `globals.css` mirrors dark mode at `:root` and light mode at `.warm`. `tailwind.config.ts` continues to consume the same serializable CSS-variable map, so it required no architecture change.

## Changed color tokens

### Neutral scale

The previous single cool scale (`#0e0e1a`, `#12121f`, `#1a1a2e`, `#22223a`, `#2a2a44`, `#34344f`, `#494965`, `#6c6c8e`, `#9494b8`, `#b4b4d4`, `#ffffff`) was replaced by these exact light/dark values:

- `0`: `#FFFDF8` / `#211F1B`
- `50`: `#FAF6EE` / `#292620`
- `100`: `#F3EDE2` / `#333029`
- `200`: `#E8DFD1` / `#403B33`
- `300`: `#D9CEBD` / `#544D42`
- `400`: `#BCAF9C` / `#70675A`
- `500`: `#958977` / `#908576`
- `600`: `#706759` / `#B0A696`
- `700`: `#514A40` / `#CEC5B8`
- `800`: `#352F28` / `#E7DFD4`
- `900`: `#211C17` / `#FFF9F0`

Added semantic aliases: `surfaceCanvas`, `surfaceRecessed`, `surfaceQuiet`, `surfaceRaised`, `borderDefault`, `borderStrong`, `textPrimary`, `textSecondary`, and `textMuted`. CSS equivalents (`--surface-*`, `--border-*-color`, and `--text-*`) prevent consumers from depending on raw scale steps.

### Accent and semantic tokens

- Accent changed from indigo (`#818cf8` base, `#6366f1` hover, `#4f46e5` active, indigo RGBA muted) to terracotta: light `#B65332` / `#99442A` / `#7A351F` / `#F5DED3`; dark `#E58A63` / `#F0A17E` / `#FFC0A3` / `#4A2D24`.
- Success changed from `#4ade80` plus RGBA muted to light `#5E7D4E` / `#E3EBDD`; dark `#9FBE8B` / `#2F4029`.
- Warning changed from `#fbbf24` plus RGBA muted to light `#9A6A21` / `#F5E8C8`; dark `#D6A852` / `#4B3920`.
- Danger changed from `#f87171` plus RGBA muted to light `#A84D43` / `#F4DCD7`; dark `#DF8B80` / `#4D2925`.

### Surface effects and shadows

- Added `designTokens.effects.heroTonalWash` and CSS `--hero-tonal-wash`: light `radial-gradient(circle at 82% 12%, rgba(182, 83, 50, 0.16), transparent 58%)`; dark `radial-gradient(circle at 82% 12%, rgba(229, 138, 99, 0.14), transparent 58%)`.
- `--gradient-hero` now aliases the hero-only tonal wash.
- Shadows changed from `0 1px 2px rgba(0,0,0,0.18)`, `0 8px 24px rgba(0,0,0,0.24)`, and `0 16px 40px rgba(0,0,0,0.32)` to the approved directional scale:
  - light: `sm` `0 1px 2px rgba(57, 43, 30, 0.08)`, `md` `0 8px 20px rgba(57, 43, 30, 0.10)`, `lg` `0 18px 42px rgba(57, 43, 30, 0.14)`;
  - dark: `sm` `0 1px 2px rgba(0, 0, 0, 0.22)`, `md` `0 8px 20px rgba(0, 0, 0, 0.28)`, `lg` `0 18px 42px rgba(0, 0, 0, 0.36)`.
- `--shadow-none` remains `none`. The historical `--shadow-glow` name remains only as a compatibility alias to `--shadow-md`; it no longer introduces a colored glow.

## Compatibility aliases

The old five-ramp API remains as a value-only compatibility layer because it is still consumed throughout the application. No old color value remains behind these names:

- `caution` resolves to warning.
- `error` resolves to danger.
- `blue` and `info` resolve to terracotta accent.
- `pink500` resolves to terracotta accent.

No component import or call site needed remapping in this phase: removing those aliases would require unrelated component changes, while retaining them preserves the token architecture and maps all callers to the new compact trio.

## Flagged component-level hardcoded colors

These visual literals were intentionally not changed; they require the later component consistency pass:

- `src/components/ErrorBoundary.tsx:73` — old neutral fallback `#12121f`.
- `src/components/ErrorBoundary.tsx:87` — old neutral fallback `#1a1a2e`.
- `src/components/ErrorBoundary.tsx:128` — old indigo accent fallback `#818cf8`.
- `src/components/simplified/ActivityHeatmap.tsx:574` — dynamic old-indigo `rgba(129, 140, 248, alpha)` heatmap fallback.

Comments containing historical color examples were not counted as visual literals.

## Chart palette

`src/styles/chartTokens.ts` was not modified. Its brighter category/data-visualization palette remains separate from UI tokens.

## Validation

- `npm run typecheck` — passed.
- `npm run build` — passed. The build environment could not download the Google Fonts Inter stylesheet, so Next.js skipped font optimization; compilation and static generation completed successfully.
