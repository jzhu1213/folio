# Motion library integration

## Package and import migration

- Installed `motion` (`^13.2.0`) and removed the direct `framer-motion` dependency.
- Normalized all application imports to `motion/react`; no source file imports `framer-motion`.
- The `motion` package includes `framer-motion` internally as its implementation dependency. It is not a second application-level icon or motion library.

## Animation migration

| Surface | Previous approach | Change |
| --- | --- | --- |
| `src/components/ui/BottomSheet.tsx` | Local Motion variants driven by `animations.ts` springs/timings; Motion `drag="y"` dismissal. | Uses shared `slideUpSheet` and token-derived transitions. Drag constraints, velocity/distance dismissal, focus handling, and the FAB-origin path remain intact. |
| `src/components/ui/DepthSurfaceTransition.tsx` | Local transition variants from `transitions.ts`, plus `AnimatePresence` and optional `layoutId`. | Uses `fadeScaleIn` while retaining `AnimatePresence mode="wait"` and shared-layout continuity through `layoutId`. |
| `src/components/ui/Toast.tsx` | Local toast variants and timing/spring values in the component. | Uses `toastSlide`: 150ms token-based enter and 200ms token-based exit. |
| `src/components/ui/ScrollAware/` | Already used Motion `useScroll`, `useTransform`, `useVelocity`, and `useSpring`; no manual DOM scroll listeners or component `requestAnimationFrame` loops were present. | Imports now use `motion/react`; `MomentumScroll` and the shared `useScrollProgress` helper use the common scroll spring preset. Existing compositor-bound scroll behavior remains unchanged. |

## Shared presets

Created `src/lib/motionPresets.ts`. It converts `designTokens.motion.duration` values from milliseconds to Motion seconds and exports:

- `motionDurations` and `motionTransitions`
- `slideUpSheet`
- `fadeScaleIn`
- `toastSlide`
- `reducedFade`

Enter transitions use the token-aligned enter curve; exits use the token-aligned exit curve. `BottomSheet`, `DepthSurfaceTransition`, `Toast`, and ScrollAware’s spring path all reference this module.

## Reduced motion

`BottomSheet`, `DepthSurfaceTransition`, and `Toast` use `reducedFade` when the OS preference is enabled. Scroll-aware components preserve their existing static/no-transform reduced-motion branches.

## Validation

- `npm run typecheck` — passed.
- `npm run build` — passed. Next.js emitted one non-blocking warning because the build environment could not download the Google Fonts Inter stylesheet, so font optimization was skipped.
