"use client"

import { motion } from "motion/react"
import { useReducedMotion } from "@/lib/animations"
import { typographyRoles } from "@/styles/typography"

export interface CategoryProgressProps {
  /** Month-to-date expense total for this category. */
  spent: number
  /** Monthly category cap. A non-positive value means no cap is configured. */
  limit: number
  /** Keeps the compact home-card layout available without a second progress style. */
  compact?: boolean
  className?: string
}

/**
 * A token-only, month-to-date category budget bar.
 *
 * No limit deliberately renders nothing: the surrounding category surface can
 * remain a useful spending tracker without implying a broken 0%-filled budget.
 * The calm warning state begins the moment spending exceeds the cap. Values
 * above the cap stay visually capped so the bar remains legible.
 */
export function CategoryProgress({ spent, limit, compact = false, className }: CategoryProgressProps) {
  const { prefersReducedMotion } = useReducedMotion()

  if (!Number.isFinite(limit) || limit <= 0) return null

  const safeSpent = Math.max(0, Number.isFinite(spent) ? spent : 0)
  const fraction = Math.min(safeSpent / limit, 1)
  // There is intentionally no grace buffer: a monthly cap is a clear boundary,
  // and showing the change at the first dollar above it avoids an arbitrary
  // second threshold.
  const isOverLimit = safeSpent > limit
  const spentLabel = Math.round(safeSpent).toLocaleString("en-US")
  const limitLabel = Math.round(limit).toLocaleString("en-US")

  return (
    <div
      className={className}
      role="progressbar"
      aria-label={isOverLimit
        ? `$${spentLabel} of $${limitLabel} monthly category limit used. A bit over this month.`
        : `$${spentLabel} of $${limitLabel} monthly category limit used`}
      aria-valuemin={0}
      aria-valuemax={limit}
      aria-valuenow={Math.min(safeSpent, limit)}
      style={{ width: "100%" }}
    >
      <div
        aria-hidden="true"
        style={{
          height: compact ? 4 : 6,
          width: "100%",
          overflow: "hidden",
          borderRadius: "var(--radius-full)",
          background: "var(--surface-recessed)",
        }}
      >
        <motion.div
          initial={false}
          animate={{ width: `${fraction * 100}%` }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "100%",
            borderRadius: "inherit",
            background: isOverLimit ? "var(--warning)" : "var(--accent)",
          }}
        />
      </div>
      {!compact && (
        <p style={{ ...typographyRoles.caption, color: "var(--text-secondary)", margin: "6px 0 0", fontVariantNumeric: "tabular-nums" }}>
          {isOverLimit ? "A bit over this month" : `$${spentLabel} of $${limitLabel} this month`}
        </p>
      )}
    </div>
  )
}
