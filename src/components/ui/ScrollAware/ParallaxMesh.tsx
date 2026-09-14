"use client"

/**
 * ParallaxMesh
 *
 * Compatibility boundary for the retired decorative mesh. The flat surface
 * system deliberately has no parallax background; the public prop shape is
 * retained while callers migrate away from this optional decoration.
 *
 * Validates: Requirements 13.1, 13.5, 8.4
 */

import type { GradientMeshVariant } from "../GradientMesh"

export interface ParallaxMeshProps {
  /** Mesh intensity for the current screen, passed through to GradientMesh. */
  variant?: GradientMeshVariant
  /**
   * How strongly the mesh trails the content. 0 = no movement (fixed),
   * 1 = moves with the content. Kept low for a gentle depth effect.
   * Defaults to 0.15.
   */
  strength?: number
  /** Maximum drift in px so long pages never over-translate. Defaults to 220. */
  maxShift?: number
  /** Extra classes applied to the parallax layer. */
  className?: string
}

export function ParallaxMesh(_props: ParallaxMeshProps) {
  return null
}
