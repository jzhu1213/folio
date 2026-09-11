"use client"

/**
 * EmptyState
 *
 * A warm, illustrated empty-state component that replaces bare emoji + text
 * patterns throughout the app. Renders a small inline SVG illustration, a
 * friendly one-liner title, an encouraging subtitle, and an optional primary
 * action button so the user is never left at a dead end.
 *
 * Phase 6, task 264 — "Empty states with personality."
 *
 * Accessibility:
 * - Illustrations are decorative (`aria-hidden`)
 * - Action button has an explicit aria-label when provided
 * - Respects `prefers-reduced-motion` for entrance animation
 *
 * Usage:
 * ```tsx
 * <EmptyState
 *   illustration="transactions"
 *   title="Ready when you are"
 *   subtitle="Log your first expense and Folio starts learning your habits"
 *   actionLabel="Log expense →"
 *   onAction={() => openExpenseSheet()}
 * />
 * ```
 */

import type { ReactNode } from "react"
import { useEffect, useRef } from "react"
import { motion } from 'motion/react'
import { useReducedMotion } from "@/lib/animations"
import { fadeScaleIn, reducedFade } from "@/lib/motionPresets"
import { track } from "@/lib/analytics"
import { Icon } from "@/components/ui/Icon"
import type { IconName } from "@/lib/icons"
import {
  emptyStateContainer,
  emptyStateTitle,
  emptyStateSubtitle,
  emptyStateAction,
  borderRadius,
  colorRamp,
} from "@/styles/shared"
import { semanticColors } from "@/styles/colors"
import { typography, fontWeights, FONT_FAMILY } from '@/styles/typography'

// ============================================================================
// Illustration types & SVGs
// ============================================================================

/**
 * Named illustration presets. Each maps to a hand-crafted inline SVG that
 * adapts to the accent theme via `currentColor` and CSS variables.
 */
export type EmptyStateIllustration =
  | "transactions"
  | "goals"
  | "filter"
  | "review"
  | "budget"
  | "generic"

/** Props for the EmptyState component. */
export interface EmptyStateProps {
  /** Named illustration preset, or a custom ReactNode. */
  illustration: EmptyStateIllustration | ReactNode
  /** Primary warm one-liner. */
  title: string
  /** Encouraging subtitle. */
  subtitle: string
  /** Primary action button label. */
  actionLabel?: string
  /** Handler for the primary action button. */
  onAction?: () => void
  /** Optional secondary action label. */
  secondaryLabel?: string
  /** Handler for the secondary action. */
  onSecondary?: () => void
  /** Accessible label override for the action button. */
  actionAriaLabel?: string
  /** Custom accent color for the action button. Defaults to accent purple. */
  actionColor?: "accent" | "success"
  /** Analytics context identifier for tracking empty state impressions (task 535.2). */
  analyticsContext?: string
}

// ============================================================================
// Illustration icon mapping
// ============================================================================

const ILLUSTRATION_ICONS: Record<EmptyStateIllustration, IconName> = {
  transactions: "nav:history",
  goals: "tool:sinking-funds",
  filter: "tip:anomaly",
  review: "tip:savings",
  budget: "tip:goal",
  generic: "tip:info",
}

function resolveIllustration(illustration: EmptyStateIllustration): ReactNode {
  return <Icon name={ILLUSTRATION_ICONS[illustration]} size={32} />
}

// ============================================================================
// Component
// ============================================================================

export function EmptyState({
  illustration,
  title,
  subtitle,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  actionAriaLabel,
  actionColor = "accent",
  analyticsContext,
}: EmptyStateProps) {
  const { prefersReducedMotion } = useReducedMotion()

  // Task 535.2: Track empty state impression (fires once per mount)
  const trackedRef = useRef(false)
  useEffect(() => {
    if (analyticsContext && !trackedRef.current) {
      trackedRef.current = true
      track('empty_state_shown', { context: analyticsContext })
    }
  }, [analyticsContext])

  const illustrationNode =
    typeof illustration === "string"
      ? resolveIllustration(illustration as EmptyStateIllustration)
      : illustration

  const actionBg =
    actionColor === "success" ? colorRamp.success[200] : colorRamp.accent[200]
  const actionBorder =
    actionColor === "success"
      ? `1px solid ${colorRamp.success[300]}`
      : `1px solid ${colorRamp.accent[300]}`
  const actionTextColor =
    actionColor === "success" ? semanticColors.success : semanticColors.accent
  const variants = prefersReducedMotion ? reducedFade : fadeScaleIn

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="enter"
      style={{
        ...emptyStateContainer,
        padding: "32px 20px",
      }}
    >
      {/* Illustration */}
      <div style={{ marginBottom: 4 }}>{illustrationNode}</div>

      {/* Title */}
      <p style={emptyStateTitle}>{title}</p>

      {/* Subtitle */}
      <p style={emptyStateSubtitle}>{subtitle}</p>

      {/* Primary action */}
      {actionLabel && onAction && (
        <motion.button
          type="button"
          onClick={() => {
            if (analyticsContext) {
              track('empty_state_cta_tapped', { context: analyticsContext })
            }
            onAction()
          }}
          className="focus-ring interactive-control"
          style={{
            ...emptyStateAction,
            background: actionBg,
            border: actionBorder,
            color: actionTextColor,
          }}
          aria-label={actionAriaLabel ?? actionLabel}
        >
          {actionLabel}
        </motion.button>
      )}

      {/* Secondary action */}
      {secondaryLabel && onSecondary && (
        <motion.button
          type="button"
          onClick={onSecondary}
          className="focus-ring interactive-control"
          style={{
            background: "none",
            border: "none",
            padding: "6px 12px",
            color: "var(--sub)",
            fontSize: typography['body-sm'].fontSize,
            fontWeight: fontWeights.medium,
            fontFamily: FONT_FAMILY,
            cursor: "pointer",
            opacity: 0.8,
          }}
        >
          {secondaryLabel}
        </motion.button>
      )}
    </motion.div>
  )
}
