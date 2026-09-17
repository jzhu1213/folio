"use client"

import type { CSSProperties } from 'react'
import { motion } from 'motion/react'
import type { Insight } from '@/lib/insights'
import { useReducedMotion, springs } from '@/lib/animations'
import { formatCurrency } from '@/lib/currencyUtils'
import { getCategoryAccent } from '@/styles/shared'
import { spacing, typographyRoles } from '@/styles/typography'
import { CategoryIcon } from './CategoryIcon'
import { GlassCard } from './GlassCard'
import { Icon } from './Icon'

export interface InsightComparison {
  /** The earlier period or plan value. */
  reference: number
  /** The current period or projected pace value. */
  current: number
  /** Defaults to "Previous" or "Plan", depending on insight type. */
  referenceLabel?: string
  /** Defaults to "Now" or "Pace", depending on insight type. */
  currentLabel?: string
}

export interface InsightCardProps {
  insight: Insight
  /**
   * Optional exact values for the supporting comparison. When omitted, the
   * component draws a relative comparison from the insight's magnitude.
   */
  comparison?: InsightComparison
  /** Called when the whole card is activated. Navigation is supplied by the caller. */
  onPress?: () => void
  className?: string
  style?: CSSProperties
}

/**
 * A compact, narrative-first surface for a single financial observation.
 * It intentionally receives an already-computed `Insight`; this component
 * never recalculates or infers a financial recommendation.
 */
export function InsightCard({
  insight,
  comparison,
  onPress,
  className,
  style,
}: InsightCardProps) {
  const { prefersReducedMotion } = useReducedMotion()
  // Pace insights describe a category that may pass its cap, so they share the
  // same calm warning token as CategoryProgress rather than a category accent.
  const accent = insight.type === 'pace' ? 'var(--warning)' : getCategoryAccent(insight.category)
  const directionLabel = getDirectionLabel(insight.direction)
  const card = (
    <GlassCard
      elevation="medium"
      className={className}
      style={{
        padding: `${spacing.md}px`,
        overflow: 'hidden',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing.sm }}>
        <CategoryIcon category={insight.category} size={32} iconSize={16} />
        <p
          style={{
            ...typographyRoles.cardHeadline,
            color: 'var(--text)',
            margin: 0,
            flex: 1,
            minWidth: 0,
          }}
        >
          {insight.sentence}
        </p>
        <DirectionIndicator direction={insight.direction} />
      </div>

      <div style={{ marginTop: spacing.sm, marginLeft: 44 }}>
        {insight.type === 'spike' ? (
          <SpikeValue amount={insight.magnitude} accent={accent} />
        ) : (
          <ComparisonBars insight={insight} comparison={comparison} accent={accent} />
        )}
      </div>
    </GlassCard>
  )

  if (!onPress) {
    return <article aria-label={getInsightAccessibleLabel('Insight', insight.sentence, directionLabel)}>{card}</article>
  }

  return (
    <motion.button
      type="button"
      onClick={onPress}
      aria-label={getInsightAccessibleLabel('Open insight', insight.sentence, directionLabel)}
      className="focus-ring"
      whileHover={prefersReducedMotion ? undefined : { y: -1 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      transition={springs.snappy}
      style={{
        display: 'block',
        width: '100%',
        minHeight: 44,
        padding: 0,
        border: 0,
        borderRadius: 'var(--radius-lg)',
        background: 'transparent',
        color: 'inherit',
        cursor: 'pointer',
        font: 'inherit',
        textAlign: 'start',
      }}
    >
      {card}
    </motion.button>
  )
}

function DirectionIndicator({ direction }: { direction: Insight['direction'] }) {
  const status = direction === 'up' ? 'warning' : direction === 'down' ? 'healthy' : 'tracking'
  const label = getDirectionLabel(direction)
  const color = direction === 'up'
    ? 'var(--warning)'
    : direction === 'down'
      ? 'var(--success)'
      : 'var(--sub)'

  return (
    <span
      role="img"
      title={label}
      style={{ color, display: 'inline-flex', flexShrink: 0, paddingTop: 2 }}
      aria-label={label}
    >
      <Icon name={`status:${status}`} size={14} />
    </span>
  )
}

function getDirectionLabel(direction: Insight['direction']): string {
  return direction === 'up'
    ? 'Spending is up'
    : direction === 'down'
      ? 'Spending is down'
      : 'Spending is steady'
}

function getInsightAccessibleLabel(prefix: string, sentence: string, directionLabel: string): string {
  const normalizedSentence = sentence.trim()
  const closingPunctuation = /[.!?]$/.test(normalizedSentence) ? '' : '.'
  return `${prefix}: ${normalizedSentence}${closingPunctuation} ${directionLabel}.`
}

function ComparisonBars({
  insight,
  comparison,
  accent,
}: {
  insight: Insight
  comparison?: InsightComparison
  accent: string
}) {
  const fallback = getRelativeComparison(insight)
  const values = comparison ?? fallback
  const referenceLabel = values.referenceLabel ?? (insight.type === 'pace' ? 'Plan' : 'Previous')
  const currentLabel = values.currentLabel ?? (insight.type === 'pace' ? 'Pace' : 'Now')
  const maximum = Math.max(values.reference, values.current, 1)
  const referenceHeight = Math.max(5, (Math.max(0, values.reference) / maximum) * 28)
  const currentHeight = Math.max(5, (Math.max(0, values.current) / maximum) * 28)

  return (
    <div
      aria-label={`${referenceLabel} compared with ${currentLabel}`}
      role="img"
      style={{ height: 48, display: 'flex', alignItems: 'end', gap: spacing.xs }}
    >
      <Bar label={referenceLabel} height={referenceHeight} color="var(--border-strong-color)" />
      <Bar label={currentLabel} height={currentHeight} color={accent} />
    </div>
  )
}

function Bar({ label, height, color }: { label: string; height: number; color: string }) {
  return (
    <div style={{ display: 'grid', gap: 4, justifyItems: 'center', minWidth: 38 }}>
      <span
        aria-hidden="true"
        style={{
          display: 'block',
          width: 26,
          height,
          borderRadius: 'var(--radius-full)',
          background: color,
          border: '1px solid var(--border-strong-color)',
          boxSizing: 'border-box',
        }}
      />
      <span style={{ ...typographyRoles.caption, color: 'var(--muted)', fontSize: 10, lineHeight: 1 }}>
        {label}
      </span>
    </div>
  )
}

function SpikeValue({ amount, accent }: { amount: number; accent: string }) {
  return (
    <div
      aria-label={`Outlier amount ${formatDollar(amount)}`}
      style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.xs,
        color: accent,
      }}
    >
      <Icon name="status:warning" size={14} />
      <span style={{ ...typographyRoles.dataTableFigure, color: 'inherit' }}>{formatDollar(amount)}</span>
      <span style={{ ...typographyRoles.caption, color: 'var(--muted)' }}>that day</span>
    </div>
  )
}

function getRelativeComparison(insight: Insight): InsightComparison {
  if (insight.type === 'pace') {
    return { reference: 100, current: 140, referenceLabel: 'Plan', currentLabel: 'Pace' }
  }

  const prior = 100
  const current = insight.direction === 'up'
    ? prior + insight.magnitude
    : insight.direction === 'down'
      ? Math.max(0, prior - insight.magnitude)
      : prior

  return { reference: prior, current, referenceLabel: 'Previous', currentLabel: 'Now' }
}

function formatDollar(amount: number): string {
  return formatCurrency(Math.abs(amount), 'USD', { fractionDigits: 0 })
}
