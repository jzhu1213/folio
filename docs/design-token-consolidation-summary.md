# Design Token Consolidation Summary

## Changed files

- `src/styles/tokens.ts` — now owns resolved color, spacing, radius, shadow, motion, elevation, and layout tokens, plus the serializable Tailwind map.
- `tailwind.config.ts` — imports that map instead of defining a separate token system.
- `src/styles/colors.ts`, `src/styles/surfaces.ts`, `src/styles/layout.ts`, and `src/styles/motion.ts` — compatibility re-export modules.
- `src/styles/shared.ts` — compatibility exports now point to `tokens.ts`; its legacy style helpers and deprecated heading exports remain available.
- `src/styles/typography.ts` — its legacy named spacing accessor now references the canonical spacing values.
- `src/app/globals.css` — CSS variables now mirror the compact palette, 4-step radius scale, 4-step shadow/glow scale, and motion scale.
- `src/components/simplified/InsightTrendCard.tsx` and `src/components/simplified/SettingsPrivacySecurityScreen.tsx` — the two audited `14px` radii now use the radius token.
- `docs/design-token-audit.md` — the Phase 1 audit retained as the migration record.

## Resolved constants

- `CONTENT_MAX_WIDTH` is **560px**. It was selected because `src/components` imports the `shared.ts` value substantially more broadly than the former `layout.ts` 480px value. `layout.ts` now re-exports the canonical constant.
- Radius is **sm 4px, md 8px, lg 16px, full 9999px**. Legacy `control`, `card`, `sheet`, and `xl` names are aliases.
- Motion `instant` is **0ms**, matching the prior `motion.ts` documentation. The CSS variable had incorrectly resolved to 100ms.

## Deliberate compatibility decisions

- Existing 10-step ramp names remain as aliases so current imports and CSS references resolve, but they now resolve to the compact accent/success/warning/danger values rather than independent ramps.
- `chartTokens.ts` and category palette metadata were intentionally unchanged.
- Component-local transition strings were intentionally not migrated.

## Validation

- `git diff --check` and TypeScript transpilation of all changed TypeScript/TSX files completed without diagnostics.
- Full `npm run typecheck` and `npm run build` could not run in this workspace because the dependency installation is incomplete: `tsc` and `next` are absent from `node_modules/.bin`; direct `tsc` also stops on missing ambient type packages. No dependency changes were made.
