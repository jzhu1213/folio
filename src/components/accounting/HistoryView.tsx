"use client"
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { TransactionList } from './TransactionList'
import type { Transaction, TransactionCategory } from '@/types'
import type { FundingSource } from '@/lib/fundingSources'
import { shiftMonth, toMonthString } from '@/lib/budgetUtils'
import { GlassCard } from '@/components/ui/GlassCard'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/EmptyState'
import { Illustration } from '@/components/ui/illustrations'
import { HistoryGroupedSkeleton } from '@/components/ui/SkeletonRow'
import { springs as springPresets, useReducedMotion } from '@/lib/animations'
import { SECTION_SPACING, DOCK_PADDING_BOTTOM } from '@/styles/shared'
import { radius } from '@/styles/surfaces'
import { FONT_FAMILY, spacing, typography, fontWeights } from '@/styles/typography'
import { useWindowScrollTracking, restoreHistoryScrollPosition } from '@/lib/useScrollVirtualization'

interface HistoryViewProps {
  transactions: Transaction[]
  isLoading?: boolean
  onEditTransaction: (tx: Transaction) => void
  onDeleteTransaction: (id: string) => void
  /** Callback to trigger bulk repeat flow (Task 93.1) */
  onRepeatTransaction?: (tx: Transaction) => void
  /** Funding sources for search/filter in TransactionList (Task 129) */
  fundingSources?: FundingSource[]
  /** Bulk delete multiple transactions (Task 131) */
  onBulkDelete?: (ids: string[]) => void
  /** Bulk recategorize multiple transactions (Task 131) */
  onBulkRecategorize?: (ids: string[], category: TransactionCategory) => void
  /** Bulk tag multiple transactions (Task 131) */
  onBulkTag?: (ids: string[], tags: string[]) => void
  /** Callback when a tag chip is tapped — filters history to that tag (Task 401.2) */
  onTagFilter?: (tag: string) => void
  /** Map of transactionId → split info for split indicators (Task 401.3) */
  splitMap?: Map<string, { splitId: string; participantCount: number }>
  /** Callback when split indicator is tapped (Task 401.3) */
  onViewSplit?: (splitId: string) => void
  /** Minimal message shown when active history criteria omit the selected month. */
  noResultsMessage?: string
  /** Clears search and filter criteria for a functional no-match state. */
  onClearCriteria?: () => void
  /** Opens the quick-add expense flow from a true history empty state. */
  onLogExpense: () => void
}

export function HistoryView({
  transactions, isLoading = false,
  onEditTransaction, onDeleteTransaction, onRepeatTransaction,
  fundingSources, onBulkDelete, onBulkRecategorize, onBulkTag,
  onTagFilter, splitMap, onViewSplit, noResultsMessage, onClearCriteria, onLogExpense,
}: HistoryViewProps) {
  const { prefersReducedMotion } = useReducedMotion()
  const springs = prefersReducedMotion ? { snappy: { duration: 0 } } : springPresets
  const [selectedMonth, setSelectedMonth] = useState(() => toMonthString(new Date()))
  const currentMonth   = toMonthString(new Date())
  const isCurrentMonth = selectedMonth === currentMonth
  const monthLabel     = new Date(selectedMonth + '-15').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const monthTxs       = transactions.filter(t => t.date.startsWith(selectedMonth))

  // Fast scroll detection for skeleton loading (Task 404.3)
  const { isScrollingFast } = useWindowScrollTracking()

  // Restore scroll position when returning from transaction detail (Task 404.2)
  useEffect(() => {
    restoreHistoryScrollPosition()
  }, [])

  return (
    <div className="pb-24" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          padding: "0 20px",
          display: "flex",
          flexDirection: "column",
          gap: SECTION_SPACING,
          paddingTop: spacing.md,
          paddingBottom: DOCK_PADDING_BOTTOM, // room for dock
        }}
      >
        {/* Month selector card */}
        <GlassCard elevation="low" style={{ padding: "20px", borderRadius: radius.control }}>
          <h2
            style={{
              fontSize: typography['body-sm'].fontSize,
              fontWeight: fontWeights.medium,
              color: "var(--sub)",
              fontFamily: "var(--font-body)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: spacing.md,
            }}
          >
            History
          </h2>

          <div className="flex items-center justify-between">
            <motion.button
              type="button"
              className="focus-ring interactive-control"
              onClick={() => setSelectedMonth(m => shiftMonth(m, -1))}
              whileTap={{ scale: 0.95 }}
              transition={springs.snappy}
              style={{
                color: 'var(--sub)',
                padding: '8px',
                background: 'var(--fill-04)',
                borderRadius: radius.control,
                border: '1px solid var(--fill-08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Previous month"
            >
              <Icon name="action:back" size={16} strokeWidth={2} />
            </motion.button>

            <p
              style={{
                fontSize: typography.body.fontSize,
                fontWeight: fontWeights.medium,
                color: 'var(--text)',
                fontFamily: FONT_FAMILY,
              }}
            >
              {monthLabel}
            </p>

            <motion.button
              type="button"
              className="focus-ring interactive-control"
              onClick={() => setSelectedMonth(m => shiftMonth(m, 1))}
              disabled={isCurrentMonth}
              whileTap={{ scale: isCurrentMonth ? 1 : 0.95 }}
              transition={springs.snappy}
              style={{
                color: isCurrentMonth ? 'var(--border)' : 'var(--sub)',
                padding: '8px',
                background: isCurrentMonth ? 'var(--fill-02)' : 'var(--fill-04)',
                borderRadius: radius.control,
                border: `1px solid ${isCurrentMonth ? 'var(--fill-04)' : 'var(--fill-08)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isCurrentMonth ? 'not-allowed' : 'pointer',
                opacity: isCurrentMonth ? 0.4 : 1,
              }}
              aria-label="Next month"
            >
              <Icon name="action:forward" size={16} strokeWidth={2} />
            </motion.button>
          </div>
        </GlassCard>

        {/* Transaction list */}
        {isLoading ? (
          <HistoryGroupedSkeleton />
        ) : noResultsMessage && monthTxs.length === 0 ? (
          <EmptyState
            illustration="filter"
            title="No matches found"
            subtitle={noResultsMessage}
            actionLabel="Clear search and filters"
            onAction={onClearCriteria}
            analyticsContext="history-filtered-empty-month"
          />
        ) : monthTxs.length === 0 ? (
          <EmptyState
            illustration={<Illustration name="empty:history-ledger" size={88} />}
            title="Your history starts here"
            subtitle="Log a first transaction and your spending story will begin to take shape."
            actionLabel="Log your first expense"
            onAction={onLogExpense}
            analyticsContext="history-true-empty"
          />
        ) : (
          <TransactionList
            transactions={monthTxs}
            onDelete={isCurrentMonth ? onDeleteTransaction : undefined}
            onEdit={isCurrentMonth ? onEditTransaction : undefined}
            onRepeat={isCurrentMonth ? onRepeatTransaction : undefined}
            fundingSources={fundingSources}
            onBulkDelete={isCurrentMonth ? onBulkDelete : undefined}
            onBulkRecategorize={isCurrentMonth ? onBulkRecategorize : undefined}
            onBulkTag={isCurrentMonth ? onBulkTag : undefined}
            onTagFilter={onTagFilter}
            splitMap={splitMap}
            onViewSplit={onViewSplit}
            isScrollingFast={isScrollingFast}
            criteriaManagedExternally
          />
        )}
      </div>
    </div>
  )
}
