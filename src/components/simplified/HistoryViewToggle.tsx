"use client"

import { useCallback, useRef } from "react"
import { motion } from 'motion/react'
import { springs as springPresets, useReducedMotion } from "@/lib/animations"
import { radius } from "@/styles/surfaces"
import { spacing, typographyRoles } from "@/styles/typography"

// ============================================================================
// Types
// ============================================================================

export type HistoryGroupingView = "timeline" | "category" | "merchant"

export interface HistoryViewToggleProps {
  value: HistoryGroupingView
  onChange: (view: HistoryGroupingView) => void
}

// ============================================================================
// Constants
// ============================================================================

const VIEW_OPTIONS: { key: HistoryGroupingView; label: string }[] = [
  { key: "timeline", label: "Timeline" },
  { key: "category", label: "By Category" },
  { key: "merchant", label: "By Merchant" },
]

// ============================================================================
// Component
// ============================================================================

/**
 * HistoryViewToggle — segmented control for switching between Timeline,
 * By Category, and By Merchant grouping modes.
 *
 * Implements roving tabindex + arrow key navigation per WAI-ARIA tabs pattern.
 *
 * Requirements: 22.4, accessibility standard
 */
export function HistoryViewToggle({ value, onChange }: HistoryViewToggleProps) {
  const { prefersReducedMotion } = useReducedMotion()
  const springs = prefersReducedMotion ? { snappy: { duration: 0 } } : springPresets
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      let nextIndex: number | null = null

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault()
        nextIndex = (index + 1) % VIEW_OPTIONS.length
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault()
        nextIndex = (index - 1 + VIEW_OPTIONS.length) % VIEW_OPTIONS.length
      } else if (e.key === "Home") {
        e.preventDefault()
        nextIndex = 0
      } else if (e.key === "End") {
        e.preventDefault()
        nextIndex = VIEW_OPTIONS.length - 1
      }

      if (nextIndex !== null) {
        tabRefs.current[nextIndex]?.focus()
        onChange(VIEW_OPTIONS[nextIndex].key)
      }
    },
    [onChange]
  )

  return (
    <div
      role="group"
      aria-label="Transaction grouping mode"
      style={{
        display: "flex",
        gap: spacing.xs,
        padding: 4,
        borderRadius: radius.control,
        background: "var(--surface-recessed)",
        border: "var(--border-default)",
      }}
    >
      {VIEW_OPTIONS.map(({ key, label }, index) => {
        const isActive = value === key
        return (
          <motion.button
            key={key}
            ref={(el: HTMLButtonElement | null) => { tabRefs.current[index] = el }}
            type="button"
            className="focus-ring interactive-control"
            aria-pressed={isActive}
            aria-label={`Group by ${label}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(key)}
            onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => handleKeyDown(e, index)}
            whileTap={{ scale: 0.97 }}
            transition={springs.snappy}
            layout
            style={{
              flex: 1,
              minHeight: 44,
              padding: "8px 10px",
              boxSizing: "border-box",
              borderRadius: radius.min,
              border: isActive ? "1px solid var(--accent)" : "1px solid transparent",
              color: isActive ? "var(--text)" : "var(--sub)",
              background: isActive ? "var(--accent-muted)" : "transparent",
              boxShadow: "var(--shadow-none)",
              cursor: "pointer",
              textAlign: "center",
              ...typographyRoles.labelButton,
            }}
          >
            {label}
          </motion.button>
        )
      })}
    </div>
  )
}
