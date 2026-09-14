"use client"

/**
 * Skeleton placeholder row that matches transaction row dimensions.
 * Shows animated shimmer bars while real content is loading during fast scroll.
 * Uses the existing `.skeleton` class from globals.css for the shimmer animation.
 */
import { spacing } from "@/styles/typography"
import { radius } from "@/styles/surfaces"
import { motion } from 'motion/react'
import { useReducedMotion } from '@/lib/animations'
import { fadeScaleIn, reducedFade } from '@/lib/motionPresets'
import { Skeleton } from './Skeleton'

export function SkeletonRow() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
        padding: '14px 16px 14px 36px',
        borderBottom: `1px solid var(--fill-04)`,
        position: 'relative',
      }}
      aria-hidden="true"
    >
      {/* Timeline dot placeholder */}
      <span
        style={{
          position: 'absolute',
          left: spacing.md,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 7,
          height: 7,
          borderRadius: radius.full,
          background: 'var(--accent-200)',
        }}
      />
      {/* Left: text placeholders */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="skeleton"
          style={{
            width: '60%',
            height: 14,
            borderRadius: radius.min,
            marginBottom: spacing.xxs + 2,
          }}
        />
        <div
          className="skeleton"
          style={{
            width: '35%',
            height: 10,
            borderRadius: radius.min,
          }}
        />
      </div>
      {/* Right: amount placeholder */}
      <div
        className="skeleton"
        style={{
          width: 56,
          height: 14,
          borderRadius: radius.min,
          flexShrink: 0,
        }}
      />
    </div>
  )
}

/**
 * A group of skeleton rows to fill visible space during fast scrolling.
 */
export function SkeletonGroup({ count = 5 }: { count?: number }) {
  return (
    <div aria-label="Loading transactions" role="status">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}

/**
 * History's initial loading state mirrors the grouped day layout: each group
 * has a date/subtotal header followed by transaction-row placeholders. The
 * base Skeleton handles shimmer and its reduced-motion opacity pulse.
 */
export function HistoryGroupedSkeleton() {
  const { prefersReducedMotion } = useReducedMotion()
  const variants = prefersReducedMotion ? reducedFade : fadeScaleIn
  const groups = [3, 2]

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label="Loading transaction history"
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
      style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}
    >
      {groups.map((rowCount, groupIndex) => (
        <div
          key={groupIndex}
          aria-hidden="true"
          style={{
            overflow: 'hidden',
            background: 'var(--color-surface)',
            border: 'var(--border-default)',
            borderRadius: radius.control,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${spacing.sm}px ${spacing.md}px`, borderBottom: 'var(--border-default)' }}>
            <Skeleton width={groupIndex === 0 ? 76 : 116} height={14} radius={radius.min} />
            <Skeleton width={64} height={14} radius={radius.min} />
          </div>
          {Array.from({ length: rowCount }, (_, rowIndex) => <SkeletonRow key={rowIndex} />)}
        </div>
      ))}
    </motion.div>
  )
}
