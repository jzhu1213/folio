'use client'

/**
 * Compatibility wrapper for the retired ambient-light treatment.
 *
 * The approved surface system permits no ambient glow. The component remains
 * available so existing imports do not break while callers migrate away.
 */
import type { HTMLAttributes } from 'react'

export type AmbientGlowStatus = 'healthy' | 'caution' | 'warning' | 'over' | 'celebration' | 'neutral'
export type AmbientGlowSize = 'sm' | 'md' | 'lg' | 'xl'
export type AmbientGlowIntensity = 'subtle' | 'medium' | 'strong'
export type AmbientGlowPosition = 'center' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface AmbientGlowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  status?: AmbientGlowStatus
  size?: AmbientGlowSize
  intensity?: AmbientGlowIntensity
  position?: AmbientGlowPosition
  fixed?: boolean
}

export function AmbientGlow({ className = '', ...rest }: AmbientGlowProps) {
  return <div aria-hidden="true" className={['ambient-glow', className].filter(Boolean).join(' ')} {...rest} />
}
