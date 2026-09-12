/**
 * Shared Motion presets derived from the canonical design tokens.
 * Motion expects seconds, while the token source intentionally uses CSS ms.
 */
import type { Transition, Variants } from 'motion/react'
import { designTokens } from '@/styles/tokens'

const seconds = (value: string) => Number.parseFloat(value) / 1000
const enterEase = [0.22, 1, 0.36, 1] as const
const exitEase = [0.4, 0, 1, 1] as const

export const motionDurations = {
  fast: seconds(designTokens.motion.duration.fast),
  base: seconds(designTokens.motion.duration.base),
  slow: seconds(designTokens.motion.duration.slow),
} as const

export const motionTransitions = {
  enter: { type: 'tween', duration: motionDurations.base, ease: enterEase } satisfies Transition,
  exit: { type: 'tween', duration: motionDurations.slow, ease: exitEase } satisfies Transition,
  toastEnter: { type: 'tween', duration: motionDurations.fast, ease: enterEase } satisfies Transition,
  toastExit: { type: 'tween', duration: motionDurations.base, ease: exitEase } satisfies Transition,
  scroll: { type: 'spring', stiffness: 260, damping: 32, mass: 0.8 } satisfies Transition,
} as const

/** One-time 300ms enter used by the Monthly Runway figure and sparkline. */
export const monthlyRunwayTransition = {
  type: 'tween',
  duration: motionDurations.slow,
  ease: enterEase,
} as const satisfies Transition

export const slideUpSheet: Variants = {
  hidden: { y: '100%' },
  visible: { y: '0%', transition: motionTransitions.enter },
  exit: { y: '100%', transition: motionTransitions.exit },
}

export const fadeScaleIn: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  enter: { opacity: 1, y: 0, scale: 1, transition: motionTransitions.enter },
  exit: { opacity: 0, y: 8, scale: 0.99, transition: motionTransitions.exit },
}

export const toastSlide: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: motionTransitions.toastEnter },
  exit: { opacity: 0, y: 8, scale: 0.97, transition: motionTransitions.toastExit },
}

export const reducedFade: Variants = {
  initial: { opacity: 0 },
  hidden: { opacity: 0 },
  animate: { opacity: 1, transition: motionTransitions.toastEnter },
  visible: { opacity: 1, transition: motionTransitions.toastEnter },
  enter: { opacity: 1, transition: motionTransitions.toastEnter },
  exit: { opacity: 0, transition: motionTransitions.toastExit },
}
