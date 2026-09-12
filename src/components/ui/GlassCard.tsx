/**
 * Flat elevated surface retained for existing composition call sites.
 *
 * The public elevation and glow props remain compatible while the visual
 * treatment now uses only the shared warm surface, border, and shadow tokens.
 */
import type { HTMLAttributes } from 'react'

export type GlassElevation = 'low' | 'medium' | 'high'
export type GlowPreset = 'none' | 'healthy' | 'caution' | 'warning' | 'over' | 'celebration'
export type GlowColor = string & {}
export type GlassGlow = GlowPreset | GlowColor

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Maps to a flat surface elevation. Defaults to `medium`. */
  elevation?: GlassElevation
  /** @deprecated Preserved for callers; glows are intentionally no longer rendered. */
  glow?: GlassGlow
}

export function GlassCard({
  elevation = 'medium',
  glow: _glow = 'none',
  className = '',
  style,
  children,
  ...rest
}: GlassCardProps) {
  return (
    <div
      className={['glass-card', `glass-card--${elevation}`, className].filter(Boolean).join(' ')}
      style={style}
      {...rest}
    >
      {children}
    </div>
  )
}
