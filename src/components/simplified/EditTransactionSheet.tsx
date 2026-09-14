"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { NumericInput } from '@/components/ui/primitives/NumericInput'
import { Input } from '@/components/ui/primitives/Input'
import { DatePickerChips } from '@/components/ui/DatePickerChips'
import { Icon } from '@/components/ui/Icon'
import { Illustration, type IllustrationName } from '@/components/ui/illustrations'
import { triggerHaptic } from '@/lib/haptics'
import { formatDateLocal, parseDateLocal } from '@/lib/dateUtils'
import { TRANSACTION_CATEGORIES, type Transaction, type TransactionCategory } from '@/types'
import { FONT_FAMILY, fontWeights, spacing, typography, typographyRoles } from '@/styles/typography'
import { radius } from '@/styles/surfaces'
import { shadows } from '@/styles/shared'

interface EditTransactionSheetProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
  onSave: (id: string, data: { amount: number; category: TransactionCategory; note?: string; date: string; isRecurring: boolean }) => Promise<Transaction | null>
  /** Called only after the explicit destructive confirmation state. */
  onDelete: (transaction: Transaction) => Promise<boolean>
  onRefund?: (transaction: Transaction) => void
}

const MAX_AMOUNT = 99999
const CATEGORY_ILLUSTRATIONS: Record<TransactionCategory, IllustrationName> = {
  food: 'category:eating-out', drinks: 'category:miscellaneous', rent: 'category:rent-utilities',
  transport: 'category:rideshare-gas', school: 'category:textbooks', fun: 'category:entertainment',
  health: 'category:miscellaneous', subscriptions: 'category:subscriptions', gig: 'category:miscellaneous',
  income: 'category:miscellaneous', other: 'category:miscellaneous',
}
const EXPENSE_CATEGORIES: TransactionCategory[] = ['food', 'drinks', 'rent', 'transport', 'school', 'fun', 'health', 'subscriptions', 'other']
const INCOME_CATEGORIES: TransactionCategory[] = ['income', 'gig', 'other']

function categoryLabel(category: TransactionCategory): string {
  return TRANSACTION_CATEGORIES.find((item) => item.category === category)?.label ?? category
}

/** A draft-only editor: close, Escape, and swipe dismissal never commit fields. */
export function EditTransactionSheet({ isOpen, onClose, transaction, onSave, onDelete, onRefund }: EditTransactionSheetProps) {
  const amountRef = useRef<HTMLInputElement>(null)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<TransactionCategory>('other')
  const [note, setNote] = useState('')
  const [date, setDate] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !transaction) return
    setAmount(transaction.amount % 1 === 0 ? String(transaction.amount) : transaction.amount.toFixed(2))
    setCategory(transaction.category)
    setNote(transaction.note ?? '')
    setDate(formatDateLocal(parseDateLocal(transaction.date)))
    setIsRecurring(Boolean(transaction.isRecurring))
    setIsSaving(false)
    setIsDeleting(false)
    setConfirmDelete(false)
    setError(null)
  }, [isOpen, transaction])

  const handleAmountChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(/[^0-9.]/g, '')
    const parts = raw.split('.')
    if (parts.length > 2 || (parts[1]?.length ?? 0) > 2 || Number.parseFloat(raw || '0') > MAX_AMOUNT) return
    setAmount(raw)
    setError(null)
  }, [])

  const handleCategoryKeys = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
    const tiles = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-category-tile]'))
    const current = tiles.indexOf(document.activeElement as HTMLButtonElement)
    if (current < 0 || tiles.length === 0) return
    event.preventDefault()
    const next = event.key === 'ArrowRight' ? (current + 1) % tiles.length
      : event.key === 'ArrowLeft' ? (current - 1 + tiles.length) % tiles.length
        : event.key === 'Home' ? 0 : tiles.length - 1
    tiles[next]?.focus({ preventScroll: true })
    tiles[next]?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [])

  const parsedAmount = Number.parseFloat(amount)
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0 && parsedAmount <= MAX_AMOUNT
  const hasChanges = transaction !== null && isAmountValid && (
    parsedAmount !== transaction.amount || category !== transaction.category || date !== transaction.date
    || (note.trim() || undefined) !== (transaction.note || undefined)
    || isRecurring !== Boolean(transaction.isRecurring)
  )
  const categories = transaction?.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const dateLabel = date ? new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(parseDateLocal(date)) : ''

  const handleSave = useCallback(async () => {
    if (!transaction || !hasChanges || isSaving) return
    if (!isAmountValid) {
      setError('Enter an amount between $0.01 and $99,999.')
      return
    }
    setIsSaving(true)
    setError(null)
    const result = await onSave(transaction.id, { amount: parsedAmount, category, note: note.trim() || undefined, date, isRecurring })
    setIsSaving(false)
    if (result) onClose()
    else setError('Could not save this transaction. Please try again.')
  }, [category, date, hasChanges, isAmountValid, isRecurring, isSaving, note, onClose, onSave, parsedAmount, transaction])

  const handleDelete = useCallback(async () => {
    if (!transaction || !confirmDelete || isDeleting) return
    setIsDeleting(true)
    const didDelete = await onDelete(transaction)
    setIsDeleting(false)
    if (didDelete) onClose()
    else setError('Could not delete this transaction. Please try again.')
  }, [confirmDelete, isDeleting, onClose, onDelete, transaction])

  const handleRefund = useCallback(() => {
    if (!transaction || !onRefund) return
    onClose()
    window.setTimeout(() => onRefund(transaction), 200)
  }, [onClose, onRefund, transaction])

  return (
    <BottomSheet isOpen={isOpen && Boolean(transaction)} onClose={onClose} maxHeight="95vh" preventClose={isSaving || isDeleting} ariaLabel="Transaction details and edit">
      {transaction && <div style={{ padding: `0 ${spacing.lg}px ${spacing.xl}px`, display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
          <div>
            <p style={{ margin: 0, color: 'var(--text)', ...typographyRoles.sectionHeadline }}>Transaction details</p>
            <p style={{ margin: `${spacing.xxs}px 0 0`, color: 'var(--sub)', fontFamily: FONT_FAMILY, fontSize: typography.caption.fontSize }}>{dateLabel}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cancel editing transaction" className="focus-ring interactive-control" style={{ width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-raised)', border: 'var(--border-default)', borderRadius: radius.full, boxShadow: shadows.sm, color: 'var(--sub)', cursor: 'pointer' }}><Icon name="action:close" size={18} strokeWidth={1.5} /></button>
        </header>

        <section aria-labelledby="edit-amount-label">
          <p id="edit-amount-label" style={{ margin: `0 0 ${spacing.xs}px`, color: 'var(--sub)', ...typographyRoles.labelButton }}>Amount</p>
          <div style={{ position: 'relative' }}>
            <span aria-hidden style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', zIndex: 1, color: 'var(--sub)', fontFamily: FONT_FAMILY, fontSize: 24, pointerEvents: 'none' }}>$</span>
            <NumericInput inputRef={amountRef} autoFocus size="xl" value={amount} onChange={handleAmountChange} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void handleSave() } }} error={Boolean(error)} aria-label="Transaction amount in dollars" aria-describedby={error ? 'edit-transaction-error' : undefined} style={{ width: '100%', textAlign: 'left', paddingInlineStart: 42, background: 'var(--surface-recessed)', borderRadius: radius.card, color: 'var(--text)', fontFamily: FONT_FAMILY, fontVariantNumeric: 'tabular-nums' }} />
          </div>
        </section>

        <section aria-labelledby="edit-category-label">
          <p id="edit-category-label" style={{ margin: `0 0 ${spacing.xs}px`, color: 'var(--sub)', ...typographyRoles.labelButton }}>Category</p>
          <div role="group" aria-label="Transaction category" onKeyDown={handleCategoryKeys} style={{ display: 'flex', overflowX: 'auto', gap: spacing.sm, padding: '2px 2px 10px', marginInline: -2, scrollSnapType: 'x proximity' }}>
            {categories.map((item) => {
              const selected = category === item
              return <button key={item} type="button" data-category-tile aria-pressed={selected} onClick={() => { setCategory(item); triggerHaptic('light') }} className="focus-ring interactive-control" style={{ flex: '0 0 104px', minHeight: 112, padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, scrollSnapAlign: 'start', background: selected ? 'var(--accent-muted)' : 'var(--surface-raised)', border: selected ? '2px solid var(--accent)' : 'var(--border-default)', borderRadius: radius.card, boxShadow: selected ? shadows.sm : 'none', color: 'var(--text)', cursor: 'pointer' }}>
                <Illustration name={CATEGORY_ILLUSTRATIONS[item]} size={44} /><span style={{ color: 'var(--text)', textAlign: 'center', ...typographyRoles.labelButton }}>{categoryLabel(item)}</span>
              </button>
            })}
          </div>
        </section>

        <section aria-labelledby="edit-date-label"><p id="edit-date-label" style={{ margin: `0 0 ${spacing.xs}px`, color: 'var(--sub)', ...typographyRoles.labelButton }}>Date</p><DatePickerChips selectedDate={date} onDateChange={setDate} allowFutureDates={false} /></section>
        <section aria-labelledby="edit-note-label"><p id="edit-note-label" style={{ margin: `0 0 ${spacing.xs}px`, color: 'var(--sub)', ...typographyRoles.labelButton }}>Note</p><Input value={note} onChange={(event) => setNote(event.target.value.replace(/<[^>]*>/g, '').slice(0, 60))} maxLength={60} placeholder="Add a note" aria-label="Transaction note" style={{ background: 'var(--surface-recessed)', borderRadius: radius.control }} /></section>

        {transaction.type === 'expense' && <button type="button" onClick={() => setIsRecurring((value) => !value)} aria-pressed={isRecurring} aria-label="This expense repeats monthly" className="focus-ring interactive-control" style={{ alignSelf: 'flex-start', minHeight: 36, padding: '0 12px', background: isRecurring ? 'var(--accent-muted)' : 'var(--surface-recessed)', border: isRecurring ? '1px solid var(--accent)' : 'var(--border-default)', borderRadius: radius.full, color: 'var(--sub)', cursor: 'pointer', ...typographyRoles.labelButton }}>This repeats · monthly</button>}
        {error && <p id="edit-transaction-error" role="alert" style={{ margin: 0, color: 'var(--error)', fontFamily: FONT_FAMILY, fontSize: typography.caption.fontSize }}>{error}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)', gap: spacing.sm }}>
          <button type="button" onClick={onClose} disabled={isSaving || isDeleting} className="focus-ring interactive-control" style={{ minHeight: 48, background: 'var(--surface-raised)', color: 'var(--sub)', border: 'var(--border-default)', borderRadius: radius.control, cursor: 'pointer', ...typographyRoles.labelButton }}>Cancel</button>
          <button type="button" onClick={() => void handleSave()} disabled={!hasChanges || isSaving || isDeleting} className="focus-ring interactive-control" style={{ minHeight: 48, background: hasChanges ? 'var(--accent)' : 'var(--surface-recessed)', color: hasChanges ? 'var(--color-canvas)' : 'var(--muted)', border: '1px solid transparent', borderRadius: radius.control, cursor: hasChanges ? 'pointer' : 'not-allowed', ...typographyRoles.labelButton }}>{isSaving ? 'Saving…' : 'Save changes'}</button>
        </div>

        {transaction.type === 'expense' && onRefund && !confirmDelete && <button type="button" onClick={handleRefund} className="focus-ring interactive-control" style={{ minHeight: 44, background: 'transparent', border: 'none', color: 'var(--success)', cursor: 'pointer', ...typographyRoles.labelButton }}>Refund this transaction</button>}
        <div style={{ borderTop: 'var(--border-default)', paddingTop: spacing.md }}>
          {confirmDelete ? <div role="alert" style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, padding: spacing.md, background: 'var(--error-muted)', border: '1px solid var(--error)', borderRadius: radius.control }}>
            <p style={{ margin: 0, color: 'var(--text)', fontFamily: FONT_FAMILY, fontWeight: fontWeights.medium }}>Delete this transaction permanently?</p><p style={{ margin: 0, color: 'var(--sub)', fontFamily: FONT_FAMILY, fontSize: typography.caption.fontSize }}>This removes it from your history, runway, and category totals.</p>
            <div style={{ display: 'flex', gap: spacing.sm }}><button type="button" onClick={() => setConfirmDelete(false)} disabled={isDeleting} className="focus-ring interactive-control" style={{ flex: 1, minHeight: 44, background: 'var(--surface-raised)', border: 'var(--border-default)', borderRadius: radius.control, color: 'var(--sub)', cursor: 'pointer', ...typographyRoles.labelButton }}>Keep it</button><button type="button" onClick={() => void handleDelete()} disabled={isDeleting} className="focus-ring interactive-control" style={{ flex: 1, minHeight: 44, background: 'var(--error)', border: '1px solid var(--error)', borderRadius: radius.control, color: 'var(--color-canvas)', cursor: 'pointer', ...typographyRoles.labelButton }}>{isDeleting ? 'Deleting…' : 'Yes, delete'}</button></div>
          </div> : <button type="button" onClick={() => setConfirmDelete(true)} disabled={isSaving} className="focus-ring interactive-control" style={{ minHeight: 44, padding: 0, background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', ...typographyRoles.labelButton }}>Delete transaction</button>}
        </div>
      </div>}
    </BottomSheet>
  )
}
