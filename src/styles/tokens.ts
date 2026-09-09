/**
 * Folio's resolved design tokens.
 *
 * This is the single TypeScript source of truth for UI color, spacing, radius,
 * elevation and motion values. `globals.css` exposes the same values as CSS
 * variables; Tailwind imports the serializable `tailwindTokens` map below.
 */
import type React from 'react'

export type TokenAccessor<T extends string> = { readonly [K in T]: string }

export const designTokens = {
  colors: {
    neutral: {
      0: '#0e0e1a', 50: '#12121f', 100: '#1a1a2e', 200: '#22223a',
      300: '#2a2a44', 400: '#34344f', 500: '#494965', 600: '#6c6c8e',
      700: '#9494b8', 800: '#b4b4d4', 900: '#ffffff',
    },
    accent: { muted: 'rgba(129, 140, 248, 0.14)', base: '#818cf8', hover: '#6366f1', active: '#4f46e5' },
    semantic: {
      success: { base: '#4ade80', muted: 'rgba(74, 222, 128, 0.14)' },
      warning: { base: '#fbbf24', muted: 'rgba(251, 191, 36, 0.14)' },
      danger: { base: '#f87171', muted: 'rgba(248, 113, 113, 0.14)' },
    },
  },
  spacing: { 4: '4px', 8: '8px', 12: '12px', 16: '16px', 24: '24px', 32: '32px', 48: '48px', 64: '64px', 96: '96px' },
  radii: { sm: '4px', md: '8px', lg: '16px', full: '9999px' },
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.18)',
    md: '0 8px 24px rgba(0, 0, 0, 0.24)',
    lg: '0 16px 40px rgba(0, 0, 0, 0.32)',
    glow: '0 0 20px rgba(129, 140, 248, 0.24)',
  },
  motion: {
    duration: { instant: '0ms', fast: '150ms', base: '200ms', slow: '300ms' },
    easing: { enter: 'cubic-bezier(0.22, 1, 0.36, 1)', exit: 'cubic-bezier(0.4, 0, 1, 1)' },
  },
} as const

/** Serializable Tailwind extension imported by tailwind.config.ts. */
export const tailwindTokens = {
  colors: {
    background: 'var(--bg)', surface: 'var(--surface)', 'surface-raised': 'var(--raised)', 'surface-overlay': 'var(--hover)',
    'surface-hover': 'var(--hover)', border: 'var(--border)', line: 'var(--line)',
    foreground: 'var(--text)', 'foreground-sub': 'var(--sub)', 'foreground-muted': 'var(--muted)', 'foreground-dim': 'var(--dim)',
    text: 'var(--text)', 'text-sub': 'var(--sub)', 'text-muted': 'var(--muted)', accent: 'var(--accent)', 'accent-muted': 'var(--accent-muted)',
    success: 'var(--success)', warning: 'var(--warning)', danger: 'var(--danger)', error: 'var(--error)', info: 'var(--info)',
    t: {
      bg: 'var(--bg)', surface: 'var(--surface)', raised: 'var(--raised)', hover: 'var(--hover)', border: 'var(--border)', line: 'var(--line)',
      text: 'var(--text)', sub: 'var(--sub)', muted: 'var(--muted)', dim: 'var(--dim)', green: 'var(--success)', 'green-bg': 'var(--success-muted)',
      red: 'var(--danger)', 'red-bg': 'var(--danger-muted)', amber: 'var(--warning)', blue: 'var(--accent)', 'blue-bg': 'var(--accent-muted)', accent: 'var(--accent)',
    },
  },
  spacing: designTokens.spacing,
  borderRadius: { sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)', full: 'var(--radius-full)' },
  boxShadow: { none: 'var(--shadow-none)', sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)', xl: 'var(--shadow-lg)', glow: 'var(--shadow-glow)', 'glow-accent': 'var(--shadow-glow)', 'glow-accent-strong': 'var(--shadow-glow)' },
  fontFamily: { sans: ['Inter', 'sans-serif'] },
  transitionDuration: { fast: designTokens.motion.duration.fast, base: designTokens.motion.duration.base, slow: designTokens.motion.duration.slow },
  transitionTimingFunction: { enter: designTokens.motion.easing.enter, exit: designTokens.motion.easing.exit },
  animation: {
    'slide-up': 'slideUp var(--duration-base) var(--ease-enter) both',
    'fade-in': 'fadeIn var(--duration-base) var(--ease-enter) both',
    'count-up': 'countUp var(--duration-base) var(--ease-enter) both',
    'fill-bar': 'fillBar var(--duration-slow) var(--ease-enter) both',
    'slide-in-right': 'slideInRight var(--duration-base) var(--ease-enter) both',
    'scale-in': 'scaleIn var(--duration-base) var(--ease-enter) both',
    shimmer: 'shimmer 1.2s linear infinite',
    'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
  },
  keyframes: {
    slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
    fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
    countUp: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
    fillBar: { from: { width: '0%' }, to: { width: 'var(--fill-width)' } },
    slideInRight: { from: { opacity: '0', transform: 'translateX(100%)' }, to: { opacity: '1', transform: 'translateX(0)' } },
    scaleIn: { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
    shimmer: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
    pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
  },
} as const

export type OpacityStep = '0' | '20' | '40' | '60' | '80' | '100'
export const opacity: TokenAccessor<OpacityStep> = { '0': 'var(--opacity-0)', '20': 'var(--opacity-20)', '40': 'var(--opacity-40)', '60': 'var(--opacity-60)', '80': 'var(--opacity-80)', '100': 'var(--opacity-100)' }
export type ZIndexLayer = 'base' | 'raised' | 'dock' | 'sheet' | 'overlay'
export const zIndex: TokenAccessor<ZIndexLayer> = { base: 'var(--z-base)', raised: 'var(--z-raised)', dock: 'var(--z-dock)', sheet: 'var(--z-sheet)', overlay: 'var(--z-overlay)' }
export const focusRing = { color: 'var(--focus-ring-color)', width: 'var(--focus-ring-width)', offset: 'var(--focus-ring-offset)' } as const
export const focusRingStyle: React.CSSProperties = { outline: '2px solid var(--focus-ring-color)', outlineOffset: '2px' }
export const focusRingReset: React.CSSProperties = { outline: 'none' }

export type RampStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
export type ColorRamp = Record<RampStep, string>
const compactRamp = (muted: string, base: string, hover: string, active: string): ColorRamp => ({ 50: muted, 100: muted, 200: muted, 300: base, 400: base, 500: base, 600: hover, 700: active, 800: active, 900: active })
export const colorRamp = {
  accent: compactRamp('var(--accent-muted)', 'var(--accent)', 'var(--accent-hover)', 'var(--accent-active)'),
  success: compactRamp('var(--success-muted)', 'var(--success)', 'var(--success)', 'var(--success)'),
  warning: compactRamp('var(--warning-muted)', 'var(--warning)', 'var(--warning)', 'var(--warning)'),
  caution: compactRamp('var(--warning-muted)', 'var(--warning)', 'var(--warning)', 'var(--warning)'),
  error: compactRamp('var(--danger-muted)', 'var(--danger)', 'var(--danger)', 'var(--danger)'),
  blue: compactRamp('var(--accent-muted)', 'var(--accent)', 'var(--accent-hover)', 'var(--accent-active)'),
  info: compactRamp('var(--accent-muted)', 'var(--accent)', 'var(--accent-hover)', 'var(--accent-active)'),
} as const
export type SurfaceColorName = 'canvas' | 'sunken' | 'surface' | 'raised' | 'overlay'
export const surfaceColors: TokenAccessor<SurfaceColorName> = { canvas: 'var(--color-canvas)', sunken: 'var(--color-sunken)', surface: 'var(--color-surface)', raised: 'var(--color-raised)', overlay: 'var(--color-overlay)' }
export type TextColorName = 'text' | 'sub' | 'muted'
export const textColors: TokenAccessor<TextColorName> = { text: 'var(--text)', sub: 'var(--sub)', muted: 'var(--muted)' }
export type GradientName = 'ambient' | 'hero' | 'action' | 'celebration'
export const gradients: TokenAccessor<GradientName> = { ambient: 'var(--gradient-ambient)', hero: 'var(--gradient-hero)', action: 'var(--gradient-action)', celebration: 'var(--gradient-celebration)' }
export const semanticColors = { accent: 'var(--accent)', success: 'var(--success)', caution: 'var(--warning)', warning: 'var(--warning)', error: 'var(--danger)', blue: 'var(--accent)', info: 'var(--accent)', borderSubtle: 'var(--border-subtle)', borderDefault: 'var(--border-default)', borderStrong: 'var(--border-strong)', borderAccent: 'var(--border-accent)' } as const
export const resolvedColors = { accent500: designTokens.colors.accent.base, success500: designTokens.colors.semantic.success.base, warning500: designTokens.colors.semantic.warning.base, warning600: designTokens.colors.semantic.warning.base, caution500: designTokens.colors.semantic.warning.base, error500: designTokens.colors.semantic.danger.base, blue500: designTokens.colors.accent.base, text: designTokens.colors.neutral[900], canvas: designTokens.colors.neutral[0], pink500: '#f472b6' } as const

export type SpacingStep = '2' | '4' | '6' | '8' | '12' | '16' | '20' | '24' | '32' | '40' | '48' | '64' | '96'
/** Official 4px-based scale; 2px is retained only as a compatibility hairline alias. */
export const spacingScale: TokenAccessor<SpacingStep> = { '2': 'var(--space-2)', '4': 'var(--space-4)', '6': 'var(--space-6)', '8': 'var(--space-8)', '12': 'var(--space-12)', '16': 'var(--space-16)', '20': 'var(--space-20)', '24': 'var(--space-24)', '32': 'var(--space-32)', '40': 'var(--space-40)', '48': 'var(--space-48)', '64': 'var(--space-64)', '96': 'var(--space-96)' }
export const spacing = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, '2xl': 48, '3xl': 64, '4xl': 96 } as const

/** 560px wins: it is the established simplified-screen width used by more components. */
export const CONTENT_MAX_WIDTH = 560 as const
export const HORIZONTAL_PADDING = 20 as const
export const HORIZONTAL_PADDING_MIN = 16 as const
export const safeArea = { top: 'env(safe-area-inset-top)', right: 'env(safe-area-inset-right)', bottom: 'env(safe-area-inset-bottom)', left: 'env(safe-area-inset-left)' } as const
export const safeAreaPadding = (basePx: number) => `${basePx}px calc(${basePx}px + ${safeArea.right}) ${basePx}px calc(${basePx}px + ${safeArea.left})`
export const safeAreaBottom = (basePx: number) => `calc(${basePx}px + ${safeArea.bottom})`
export const safeAreaTop = (basePx: number) => `calc(${basePx}px + ${safeArea.top})`
export const contentColumn: React.CSSProperties = { width: '100%', maxWidth: `${CONTENT_MAX_WIDTH}px`, marginInlineStart: 'auto', marginInlineEnd: 'auto', paddingInlineStart: `${HORIZONTAL_PADDING}px`, paddingInlineEnd: `${HORIZONTAL_PADDING}px`, boxSizing: 'border-box' }

export type RadiusName = 'min' | 'control' | 'card' | 'sheet' | 'full'
/** Legacy names intentionally alias the four-step radius scale. */
export const radius: TokenAccessor<RadiusName> = { min: 'var(--radius-sm)', control: 'var(--radius-md)', card: 'var(--radius-lg)', sheet: 'var(--radius-lg)', full: 'var(--radius-full)' }
export const radiusValues: Record<RadiusName, number> = { min: 4, control: 8, card: 16, sheet: 16, full: 9999 }
export const nestedRadius = (outerRadius: number, padding: number) => Math.max(4, outerRadius - padding)
export const borderRadius = { sm: 4, md: 8, lg: 16, xl: 16, full: 9999 } as const

export type ElevationTier = 'canvas' | 'sunken' | 'resting' | 'raised' | 'overlay'
export interface ElevationDefinition { readonly fill: string; readonly border: string; readonly shadow: string; readonly blur: string; readonly opaqueFallback?: string }
export const elevations: Record<ElevationTier, ElevationDefinition> = {
  canvas: { fill: 'var(--color-canvas)', border: 'var(--border-subtle)', shadow: 'var(--shadow-none)', blur: 'var(--blur-none)' },
  sunken: { fill: 'var(--color-sunken)', border: 'var(--border-subtle)', shadow: 'var(--shadow-none)', blur: 'var(--blur-none)' },
  resting: { fill: 'var(--color-surface)', border: 'var(--border-default)', shadow: 'var(--shadow-sm)', blur: 'var(--blur-none)' },
  raised: { fill: 'var(--color-raised)', border: 'var(--border-strong)', shadow: 'var(--shadow-md)', blur: 'var(--blur-raised)', opaqueFallback: 'var(--color-raised-opaque)' },
  overlay: { fill: 'var(--color-overlay)', border: 'var(--border-accent)', shadow: 'var(--shadow-lg)', blur: 'var(--blur-overlay)', opaqueFallback: 'var(--color-overlay-opaque)' },
}
export const tierMap: Record<ElevationTier, readonly string[]> = { canvas: ['AppShell (page background)', 'Ambient field', 'OverlayScreen backdrop'], sunken: ['Input wells', 'Search fields', 'Inset areas / code blocks', 'Toggle track (off state)'], resting: ['Card (default)', 'ListRow containers', 'SectionHeader panels', 'ChartFrame', 'EmptyState / ErrorState'], raised: ['AllowanceHero', 'NavigationDock', 'Floating action cards', 'Tooltips', 'QuickLogControl (expanded)'], overlay: ['Sheet (half / full)', 'Modal dialogs', 'CelebrationOverlay', 'Dropdown menus', 'ContextMenu'] }
export const shadows = { none: 'var(--shadow-none)', sm: 'var(--shadow-sm)', md: 'var(--shadow-md)', lg: 'var(--shadow-lg)', xl: 'var(--shadow-lg)', glowAccent: 'var(--shadow-glow)', glowAccentStrong: 'var(--shadow-glow)', focusRing: '0 0 0 2px var(--focus-ring-color)' } as const

export interface SpringPreset { readonly stiffness: number; readonly damping: number; readonly mass: number }
export type SpringPresetName = 'snappy' | 'gentle' | 'bouncy' | 'responsive' | 'sheet' | 'dramatic'
export const springPresets: Record<SpringPresetName, SpringPreset> = { snappy: { stiffness: 400, damping: 30, mass: 1 }, gentle: { stiffness: 200, damping: 24, mass: 1 }, bouncy: { stiffness: 500, damping: 15, mass: 1 }, responsive: { stiffness: 600, damping: 35, mass: 0.8 }, sheet: { stiffness: 380, damping: 36, mass: 1 }, dramatic: { stiffness: 420, damping: 14, mass: 0.9 } }
export type DurationName = 'instant' | 'fast' | 'normal' | 'slow' | 'slower'
/** Legacy keys alias the three named durations; instant is intentionally 0ms. */
export const durations: TokenAccessor<DurationName> = { instant: 'var(--duration-instant)', fast: 'var(--duration-fast)', normal: 'var(--duration-base)', slow: 'var(--duration-slow)', slower: 'var(--duration-slow)' }
export type EasingName = 'default' | 'in' | 'out' | 'spring'
export const easings: TokenAccessor<EasingName> = { default: 'var(--ease-enter)', in: 'var(--ease-exit)', out: 'var(--ease-enter)', spring: 'var(--ease-enter)' }
