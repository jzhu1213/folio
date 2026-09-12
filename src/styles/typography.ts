/**
 * Folio's typography system.
 *
 * Fraunces is reserved for display hierarchy; DM Sans carries interface and
 * data text. The font files are loaded once in `src/app/layout.tsx` and their
 * CSS variables are exposed by `globals.css`.
 */
import type { CSSProperties } from 'react'
import { spacing as tokenSpacing } from './tokens'

/** Body copy, controls, and tabular data. */
export const BODY_FONT_FAMILY = 'var(--font-body), Arial, sans-serif' as const
/** Display hierarchy only: runway values, screen titles, and section headings. */
export const DISPLAY_FONT_FAMILY = 'var(--font-display), Georgia, serif' as const
/** @deprecated Use BODY_FONT_FAMILY or DISPLAY_FONT_FAMILY when the role is known. */
export const FONT_FAMILY = BODY_FONT_FAMILY

/** Kept because `pxToRem` remains part of the public compatibility API. */
export const ROOT_FONT_SIZE_PX = 16 as const
export function pxToRem(px: number): string {
  return `${px / ROOT_FONT_SIZE_PX}rem`
}

export const fontWeights = {
  thin: 200,
  light: 300,
  regular: 400,
  medium: 500,
  section: 550,
  semibold: 600,
  bold: 700,
} as const

export type FontWeightName = keyof typeof fontWeights
export type FontWeightValue = (typeof fontWeights)[FontWeightName]

export const letterSpacing = {
  tighter: '-0.03em',
  tight: '-0.02em',
  snug: '-0.01em',
  normal: '0em',
  wide: '0.06em',
} as const
export type LetterSpacingName = keyof typeof letterSpacing

export interface TypeStyle {
  fontFamily: string
  fontSize: string
  fontWeight: FontWeightValue
  lineHeight: CSSProperties['lineHeight']
  letterSpacing: string
  textTransform?: CSSProperties['textTransform']
  fontVariantNumeric?: CSSProperties['fontVariantNumeric']
}

/** The approved role-based scale from the creative direction. */
export type TypographyRole =
  | 'monthlyRunwayNumber'
  | 'screenTitle'
  | 'sectionHeadline'
  | 'cardHeadline'
  | 'body'
  | 'labelButton'
  | 'caption'
  | 'dataTableFigure'

export const typographyRoles: Record<TypographyRole, TypeStyle> = {
  monthlyRunwayNumber: {
    fontFamily: DISPLAY_FONT_FAMILY,
    fontSize: 'var(--type-monthly-runway-size)',
    fontWeight: fontWeights.semibold,
    lineHeight: 'var(--type-monthly-runway-line-height)',
    letterSpacing: letterSpacing.tighter,
    fontVariantNumeric: 'tabular-nums',
  },
  screenTitle: {
    fontFamily: DISPLAY_FONT_FAMILY,
    fontSize: 'var(--type-screen-title-size)',
    fontWeight: fontWeights.semibold,
    lineHeight: 'var(--type-screen-title-line-height)',
    letterSpacing: letterSpacing.tight,
  },
  sectionHeadline: {
    fontFamily: DISPLAY_FONT_FAMILY,
    fontSize: 'var(--type-section-headline-size)',
    fontWeight: fontWeights.section,
    lineHeight: 'var(--type-section-headline-line-height)',
    letterSpacing: letterSpacing.tight,
  },
  cardHeadline: {
    fontFamily: BODY_FONT_FAMILY,
    fontSize: 'var(--type-card-headline-size)',
    fontWeight: fontWeights.semibold,
    lineHeight: 'var(--type-card-headline-line-height)',
    letterSpacing: letterSpacing.snug,
  },
  body: {
    fontFamily: BODY_FONT_FAMILY,
    fontSize: 'var(--type-body-size)',
    fontWeight: fontWeights.regular,
    lineHeight: 'var(--type-body-line-height)',
    letterSpacing: letterSpacing.normal,
  },
  labelButton: {
    fontFamily: BODY_FONT_FAMILY,
    fontSize: 'var(--type-label-button-size)',
    fontWeight: fontWeights.semibold,
    lineHeight: 'var(--type-label-button-line-height)',
    letterSpacing: letterSpacing.normal,
  },
  caption: {
    fontFamily: BODY_FONT_FAMILY,
    fontSize: 'var(--type-caption-size)',
    fontWeight: fontWeights.medium,
    lineHeight: 'var(--type-caption-line-height)',
    letterSpacing: letterSpacing.normal,
  },
  dataTableFigure: {
    fontFamily: BODY_FONT_FAMILY,
    fontSize: 'var(--type-data-figure-size)',
    fontWeight: fontWeights.semibold,
    lineHeight: 'var(--type-data-figure-line-height)',
    letterSpacing: letterSpacing.normal,
    fontVariantNumeric: 'tabular-nums',
  },
}

/**
 * Existing names remain as compatibility aliases while screens are migrated
 * intentionally. They only point at approved role styles; no retired values
 * remain in the system.
 */
export type TypeScaleName =
  | 'display-lg'
  | 'display'
  | 'display-sm'
  | 'title'
  | 'headline'
  | 'subhead'
  | 'body'
  | 'body-sm'
  | 'caption'
  | 'overline'

export const typography: Record<TypeScaleName, TypeStyle> = {
  'display-lg': typographyRoles.monthlyRunwayNumber,
  display: typographyRoles.monthlyRunwayNumber,
  'display-sm': typographyRoles.monthlyRunwayNumber,
  title: typographyRoles.screenTitle,
  headline: typographyRoles.sectionHeadline,
  subhead: typographyRoles.cardHeadline,
  body: typographyRoles.body,
  'body-sm': typographyRoles.labelButton,
  caption: typographyRoles.caption,
  overline: {
    ...typographyRoles.labelButton,
    letterSpacing: letterSpacing.wide,
    textTransform: 'uppercase',
  },
}

/**
 * Compatibility API retained for the runway hero, which still interpolates
 * its figure weight. Its existing timing is intentionally unchanged here.
 */
export const FONT_WEIGHT_TRANSITION_MS = 300 as const
export const FONT_WEIGHT_TRANSITION_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)' as const
export function fontWeightTransition(
  durationMs: number = FONT_WEIGHT_TRANSITION_MS,
  easing: string = FONT_WEIGHT_TRANSITION_EASING,
): string {
  return `font-weight ${durationMs}ms ${easing}`
}
export function animatedFontWeight(
  weight: FontWeightValue,
  durationMs: number = FONT_WEIGHT_TRANSITION_MS,
  easing: string = FONT_WEIGHT_TRANSITION_EASING,
): Pick<CSSProperties, 'fontWeight' | 'transition'> {
  return { fontWeight: weight, transition: fontWeightTransition(durationMs, easing) }
}

export const spacing = {
  xxs: tokenSpacing.xxs,
  xs: tokenSpacing.xs,
  sm: tokenSpacing.sm,
  md: tokenSpacing.md,
  lg: tokenSpacing.lg,
  xl: tokenSpacing.xl,
  xxl: tokenSpacing['2xl'],
  xxxl: tokenSpacing['3xl'],
} as const
export type SpacingName = keyof typeof spacing
export type SpacingValue = (typeof spacing)[SpacingName]
export function space(name: SpacingName): string {
  return `${spacing[name]}px`
}

/** Apply tabular figures without forcing a display font onto data. */
export const TABULAR_NUMS: Pick<CSSProperties, 'fontFamily' | 'fontVariantNumeric'> = {
  fontFamily: BODY_FONT_FAMILY,
  fontVariantNumeric: 'tabular-nums',
}

/** Preserved CSS hook for existing hero markup. */
export const DISPLAY_GRADIENT_CLASS = 'display-gradient-text' as const
