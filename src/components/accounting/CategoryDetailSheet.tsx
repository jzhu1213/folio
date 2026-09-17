"use client"
import { TRANSACTION_CATEGORIES } from '@/types'
import type { Transaction, TransactionCategory } from '@/types'
import type { CategoryBudgetRow } from '@/lib/budgetUtils'
import { weekStart } from '@/lib/budgetUtils'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { CategoryProgress } from '@/components/ui/CategoryProgress'
import { Icon } from '@/components/ui/Icon'
import { FONT_FAMILY, typography } from '@/styles/typography'

interface CategoryDetailSheetProps {
  isOpen: boolean
  onClose: () => void
  row: CategoryBudgetRow | null
  transactions: Transaction[]
  onLogHere: (category: TransactionCategory) => void
}

function getLabel(cat: TransactionCategory) {
  return TRANSACTION_CATEGORIES.find(c => c.category === cat)?.label ?? cat
}

export function CategoryDetailSheet({
  isOpen, onClose, row, transactions, onLogHere,
}: CategoryDetailSheetProps) {
  if (!row) return null

  const ws         = weekStart()
  const recentTxs  = transactions
    .filter(t => t.category === row.category && t.type === 'expense' && t.date >= ws)
    .slice(0, 3)
  const isOverMonthly = row.hasLimit && row.monthlySpent > row.availableMonthlyLimit

  const leftLabel = (() => {
    if (!row.hasLimit) return row.weeklySpent > 0 ? `$${row.weeklySpent.toFixed(0)} spent this week` : 'No limit set'
    if (isOverMonthly) return 'A bit over this month'
    return `$${Math.max(0, row.weeklyLeft).toFixed(0)} left this week`
  })()

  const statusColor = !row.hasLimit ? 'var(--sub)'
    : isOverMonthly ? 'var(--warning)'
    : row.nearLimit ? 'var(--amber)'
    : 'var(--green)'

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'var(--color-canvas)' }}
        onClick={onClose}
      />

      <div className={`sheet ${isOpen ? 'open' : ''}`} style={{ maxHeight: '75vh' }}>
        <div className="sheet-handle" />

        <div className="px-6 pb-5 flex items-start justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <CategoryIcon category={row.category} size={48} />
            <div>
              <p style={{ fontSize: '17px', color: 'var(--text)' }}>{row.label}</p>
              <p style={{
                fontFamily: FONT_FAMILY, fontSize: typography.body.fontSize,
                color: statusColor, marginTop: '4px',
              }}>
                {leftLabel}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--muted)', padding: '4px' }}>
            <Icon name="action:close" size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6 flex-1 overflow-y-auto">
          {row.hasLimit && (
            <div>
              <span className="label">This month</span>
              <div style={{ marginTop: 8 }}>
                <CategoryProgress spent={row.monthlySpent} limit={row.availableMonthlyLimit} />
                <div style={{ marginTop: 16, display: 'grid', gap: 6, fontFamily: FONT_FAMILY, fontSize: typography['body-sm'].fontSize, fontVariantNumeric: 'tabular-nums' }}>
                  <p style={{ margin: 0, color: 'var(--sub)' }}>Base monthly limit <span style={{ color: 'var(--text)', float: 'right' }}>${row.monthlyLimit.toFixed(0)}</span></p>
                  {row.rolloverAmount > 0 && <><p style={{ margin: 0, color: 'var(--sub)' }}>Carried over <span style={{ color: 'var(--text)', float: 'right' }}>+${row.rolloverAmount.toFixed(0)}</span></p><p style={{ margin: 0, color: 'var(--warning)', fontVariantNumeric: 'normal' }}>Includes ${row.rolloverAmount.toFixed(0)} carried over from last month.</p></>}
                  <p style={{ margin: 0, paddingTop: 6, borderTop: '1px solid var(--border)', color: 'var(--sub)' }}>Available this month <span style={{ color: 'var(--text)', float: 'right' }}>${row.availableMonthlyLimit.toFixed(0)}</span></p>
                </div>
              </div>
            </div>
          )}

          {recentTxs.length > 0 && (
            <div>
              <p className="label mb-3">This week</p>
              {recentTxs.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <span style={{ fontSize: typography.body.fontSize, color: 'var(--text)' }} className="truncate flex-1 mr-4">
                    {tx.note || getLabel(tx.category)}
                  </span>
                  <span style={{ fontFamily: FONT_FAMILY, fontSize: typography.body.fontSize, color: 'var(--sub)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                    −${tx.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {recentTxs.length === 0 && (
            <p style={{ fontSize: typography.body.fontSize, color: 'var(--muted)' }}>No spending in this category yet this week.</p>
          )}
        </div>

        <div className="px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => { onLogHere(row.category); onClose() }}
            className="w-full btn-primary"
          >
            Log expense here
          </button>
        </div>
      </div>
    </>
  )
}
