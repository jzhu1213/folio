/**
 * Compatibility boundary for the retired animated mesh backdrop.
 *
 * The flat canvas now supplies the page background. This component intentionally
 * renders nothing while keeping the existing import and prop interface stable.
 */
type GradientMeshVariant = 'home' | 'muted'

interface GradientMeshProps {
  variant?: GradientMeshVariant
  className?: string
}

export function GradientMesh(_props: GradientMeshProps) {
  return null
}

export type { GradientMeshVariant, GradientMeshProps }
