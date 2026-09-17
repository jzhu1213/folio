"use client"

import { useMemo, useState } from 'react'
import { BUDGET_CATEGORIES } from '@/types'
import type { Budget, Transaction, TransactionCategory } from '@/types'
import type { CustomCategory } from '@/types/folio'
import { CategoryProgress } from '@/components/ui/CategoryProgress'
import { Icon } from '@/components/ui/Icon'
import { Illustration, ILLUSTRATION_LABELS, type IllustrationName } from '@/components/ui/illustrations'
import { categoryPalette } from '@/styles/chartTokens'
import { isCategoryRolloverEnabled } from '@/lib/budgetUtils'
import { shadows } from '@/styles/shared'
import { FONT_FAMILY, typographyRoles, spacing } from '@/styles/typography'
import { radius } from '@/styles/surfaces'

type CategoryUpdate = { label?: string; illustration?: string; color?: string; archived?: boolean; sortOrder?: number }

export interface CategoryManagementScreenProps {
  customCategories: CustomCategory[]
  budgets: Budget[]
  previousMonthBudgets?: Budget[]
  transactions: Transaction[]
  onAddCustomCategory: (label: string, emoji: string, icon?: string, options?: { illustration?: string; color?: string }) => Promise<CustomCategory | null>
  onUpdateCustomCategory: (id: string, updates: CategoryUpdate) => Promise<CustomCategory | null>
  onUpdateBudget: (category: TransactionCategory, limit: number) => Promise<unknown> | void
  onClose: () => void
}

const ILLUSTRATION_OPTIONS = Object.keys(ILLUSTRATION_LABELS) as IllustrationName[]
const COLOR_SWATCHES = Array.from(new Set(Object.values(categoryPalette))).filter((color) => color !== categoryPalette.fallback)

function illustrationFor(category: CustomCategory): IllustrationName {
  return ILLUSTRATION_OPTIONS.includes(category.illustration as IllustrationName) ? category.illustration as IllustrationName : 'category:miscellaneous'
}
function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
function SwatchPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return <div role="group" aria-label="Choose a category color" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    {COLOR_SWATCHES.map((color) => <button key={color} type="button" onClick={() => onChange(color)} aria-label={`Use category color ${color}`} aria-pressed={value === color} className="focus-ring interactive-control" style={{ width: 32, height: 32, borderRadius: radius.full, background: color, border: value === color ? '3px solid var(--text)' : '1px solid var(--border)', boxShadow: value === color ? shadows.sm : 'none', cursor: 'pointer' }} />)}
  </div>
}
function IllustrationPicker({ value, onChange }: { value: IllustrationName; onChange: (name: IllustrationName) => void }) {
  return <div role="group" aria-label="Choose a category icon" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(64px, 1fr))', gap: 8 }}>
    {ILLUSTRATION_OPTIONS.map((name) => <button key={name} type="button" onClick={() => onChange(name)} aria-label={`Use ${ILLUSTRATION_LABELS[name]} icon`} aria-pressed={value === name} className="focus-ring interactive-control" style={{ minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: value === name ? 'var(--accent-muted)' : 'var(--surface-recessed)', border: value === name ? '2px solid var(--accent)' : '1px solid var(--border)', borderRadius: radius.control, cursor: 'pointer' }}><Illustration name={name} size={36} /></button>)}
  </div>
}

/** The permanent full-screen home for category presentation and monthly caps. */
export function CategoryManagementScreen({ customCategories, budgets, previousMonthBudgets = [], transactions, onAddCustomCategory, onUpdateCustomCategory, onUpdateBudget, onClose }: CategoryManagementScreenProps) {
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<CustomCategory | null>(null)
  const [limitCategory, setLimitCategory] = useState<TransactionCategory | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_SWATCHES[0])
  const [illustration, setIllustration] = useState<IllustrationName>('category:miscellaneous')
  const [limit, setLimit] = useState('')
  const [saving, setSaving] = useState(false)
  const month = currentMonth()
  const activeCategories = useMemo(() => customCategories.filter((category) => !category.archived).sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER)), [customCategories])
  const archivedCategories = useMemo(() => customCategories.filter((category) => category.archived), [customCategories])
  const limitFor = (category: TransactionCategory) => budgets.find((budget) => budget.category === category && budget.month === month)?.monthlyLimit ?? 0
  const spentFor = (category: TransactionCategory) => transactions.filter((transaction) => transaction.type === 'expense' && transaction.category === category && transaction.date.startsWith(month)).reduce((total, transaction) => total + transaction.amount, 0)
  const availableFor = (category: TransactionCategory) => {
    const base = limitFor(category)
    const previous = previousMonthBudgets.find((budget) => budget.category === category)
    const carried = previous && isCategoryRolloverEnabled() ? Math.min(Math.max(0, previous.monthlyLimit - previous.spent), previous.monthlyLimit * 0.5) : 0
    return base + carried
  }
  const closeEditor = () => { setCreating(false); setEditing(null); setLimitCategory(null) }
  const beginCreate = () => { setName(''); setColor(COLOR_SWATCHES[0]); setIllustration('category:miscellaneous'); setLimit(''); setEditing(null); setLimitCategory(null); setCreating(true) }
  const beginEdit = (category: CustomCategory) => { setName(category.label); setColor(category.color && COLOR_SWATCHES.includes(category.color) ? category.color : COLOR_SWATCHES[0]); setIllustration(illustrationFor(category)); setLimit(String(limitFor('other') || '')); setCreating(false); setLimitCategory(null); setEditing(category) }
  const beginLimitEdit = (category: TransactionCategory) => { setLimit(String(limitFor(category) || '')); setCreating(false); setEditing(null); setLimitCategory(category) }
  const save = async () => {
    if (saving) return
    const parsedLimit = Math.max(0, Number(limit) || 0)
    if (!limitCategory && !name.trim()) return
    setSaving(true)
    try {
      if (limitCategory) await onUpdateBudget(limitCategory, parsedLimit)
      else if (creating) {
        const result = await onAddCustomCategory(name.trim(), '•', undefined, { illustration, color })
        if (result && parsedLimit > 0) await onUpdateBudget('other', parsedLimit)
      } else if (editing) {
        const result = await onUpdateCustomCategory(editing.id, { label: name.trim(), illustration, color })
        if (result) await onUpdateBudget('other', parsedLimit)
      }
      closeEditor()
    } finally { setSaving(false) }
  }
  const moveCategory = async (category: CustomCategory, direction: -1 | 1) => {
    const index = activeCategories.findIndex((item) => item.id === category.id)
    const swap = activeCategories[index + direction]
    if (!swap) return
    await Promise.all([onUpdateCustomCategory(category.id, { sortOrder: index + direction }), onUpdateCustomCategory(swap.id, { sortOrder: index })])
  }
  const archive = async (category: CustomCategory) => {
    const hasCurrentTransactions = transactions.some((transaction) => transaction.type === 'expense' && transaction.category === 'other' && transaction.date.startsWith(month))
    const isLastActiveCustom = activeCategories.length === 1
    if ((hasCurrentTransactions || isLastActiveCustom) && !window.confirm(hasCurrentTransactions ? `Keep ${category.label} in your history, but archive it from future category pickers? This month has spending in Other.` : `Archive your last active custom category, ${category.label}? You can restore it anytime.`)) return
    await onUpdateCustomCategory(category.id, { archived: true })
  }
  const editorOpen = creating || editing !== null || limitCategory !== null
  const editingLimitOnly = limitCategory !== null

  return <main style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px 120px', fontFamily: FONT_FAMILY }}>
    <header style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
      <button type="button" onClick={onClose} aria-label="Close category management" className="focus-ring interactive-control" style={{ width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: radius.full, cursor: 'pointer' }}><Icon name="action:close" size={18} strokeWidth={1.5} /></button>
      <div style={{ flex: 1 }}><h1 style={{ margin: 0, color: 'var(--text)', ...typographyRoles.screenTitle }}>Your categories</h1><p style={{ margin: '4px 0 0', color: 'var(--sub)', ...typographyRoles.body }}>Set monthly caps and tailor the categories you use.</p></div>
      <button type="button" onClick={beginCreate} className="focus-ring interactive-control" style={{ minHeight: 44, padding: '0 14px', background: 'var(--accent)', color: 'var(--text)', border: '1px solid var(--accent)', borderRadius: radius.control, cursor: 'pointer', ...typographyRoles.labelButton }}>New</button>
    </header>
    {editorOpen && <section aria-labelledby="category-editor-title" style={{ marginBottom: spacing.lg, padding: 16, background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: radius.card, boxShadow: shadows.sm }}>
      <h2 id="category-editor-title" style={{ margin: '0 0 12px', color: 'var(--text)', ...typographyRoles.cardHeadline }}>{editingLimitOnly ? 'Monthly limit' : creating ? 'New category' : 'Edit category'}</h2>
      {!editingLimitOnly && <><label htmlFor="category-name" style={labelStyle}>Name</label><input id="category-name" value={name} onChange={(event) => setName(event.target.value.slice(0, 30))} maxLength={30} autoFocus className="focus-ring interactive-field" style={inputStyle} /><p style={sectionLabelStyle}>Color</p><SwatchPicker value={color} onChange={setColor} /><p style={sectionLabelStyle}>Icon</p><IllustrationPicker value={illustration} onChange={setIllustration} /></>}
      <label htmlFor="category-limit" style={{ ...labelStyle, marginTop: 16 }}>Monthly limit <span style={{ color: 'var(--muted)' }}>(optional)</span></label><input id="category-limit" inputMode="decimal" type="number" min="0" step="1" value={limit} onChange={(event) => setLimit(event.target.value)} placeholder="No limit" className="focus-ring interactive-field" style={inputStyle} />
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}><button type="button" onClick={() => void save()} disabled={saving || (!editingLimitOnly && !name.trim())} className="focus-ring interactive-control" style={primaryButtonStyle}>{saving ? 'Saving…' : 'Save'}</button><button type="button" onClick={closeEditor} className="focus-ring interactive-control" style={secondaryButtonStyle}>Cancel</button></div>
    </section>}
    <section aria-labelledby="built-in-categories"><h2 id="built-in-categories" style={headingStyle}>Core categories</h2><p style={mutedBodyStyle}>These keep existing transaction history organized. Set a cap for any category you want to track.</p><div style={listStyle}>{BUDGET_CATEGORIES.map((category) => <CategoryRow key={category.category} label={category.label} emoji={category.emoji} color={categoryPalette[category.category]} spent={spentFor(category.category)} limit={availableFor(category.category)} onEditLimit={() => beginLimitEdit(category.category)} />)}</div></section>
    <section aria-labelledby="custom-categories" style={{ marginTop: spacing.xl }}><h2 id="custom-categories" style={headingStyle}>Custom categories</h2>{activeCategories.length === 0 ? <p style={mutedBodyStyle}>Add a category for spending that matters to you.</p> : <div style={listStyle}>{activeCategories.map((category, index) => <CategoryRow key={category.id} label={category.label} illustration={illustrationFor(category)} color={category.color ?? COLOR_SWATCHES[0]} spent={spentFor('other')} limit={availableFor('other')} onEdit={() => beginEdit(category)} onEditLimit={() => beginLimitEdit('other')} onMoveUp={index > 0 ? () => void moveCategory(category, -1) : undefined} onMoveDown={index < activeCategories.length - 1 ? () => void moveCategory(category, 1) : undefined} onArchive={() => void archive(category)} />)}</div>}</section>
    {archivedCategories.length > 0 && <section aria-labelledby="archived-categories" style={{ marginTop: spacing.xl }}><h2 id="archived-categories" style={{ ...headingStyle, color: 'var(--sub)' }}>Archived</h2><p style={mutedBodyStyle}>Archived categories stay on historical transactions and can be restored anytime.</p><div style={listStyle}>{archivedCategories.map((category) => <CategoryRow key={category.id} label={category.label} illustration={illustrationFor(category)} color={category.color ?? COLOR_SWATCHES[0]} spent={spentFor('other')} limit={availableFor('other')} archived onRestore={() => void onUpdateCustomCategory(category.id, { archived: false })} />)}</div></section>}
  </main>
}

function CategoryRow({ label, emoji, illustration, color, spent, limit, archived, onEdit, onEditLimit, onMoveUp, onMoveDown, onArchive, onRestore }: { label: string; emoji?: string; illustration?: IllustrationName; color: string; spent: number; limit: number; archived?: boolean; onEdit?: () => void; onEditLimit?: () => void; onMoveUp?: () => void; onMoveDown?: () => void; onArchive?: () => void; onRestore?: () => void }) {
  return <article style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, opacity: archived ? 0.72 : 1, background: archived ? 'var(--surface-recessed)' : 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: radius.card }}>
    {illustration ? <Illustration name={illustration} size={40} /> : <span aria-hidden="true" style={{ width: 40, textAlign: 'center', fontSize: 28 }}>{emoji}</span>}<span aria-label={`Color ${color}`} style={{ width: 14, height: 14, borderRadius: radius.full, background: color, border: '1px solid var(--border)', flexShrink: 0 }} />
    <div style={{ flex: 1, minWidth: 0 }}><p style={{ margin: 0, color: 'var(--text)', ...typographyRoles.cardHeadline }}>{label}</p><div style={{ marginTop: 8 }}><CategoryProgress spent={spent} limit={limit} compact /></div><p style={{ margin: '5px 0 0', color: limit > 0 && spent > limit ? 'var(--warning)' : 'var(--muted)', ...typographyRoles.caption }}>{limit > 0 ? spent > limit ? 'A bit over this month' : `$${Math.round(spent)} of $${Math.round(limit)} this month` : 'No monthly limit'}</p></div>
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 6 }}>{onMoveUp && <button type="button" onClick={onMoveUp} aria-label={`Move ${label} up`} className="focus-ring interactive-control" style={smallButtonStyle}>↑</button>}{onMoveDown && <button type="button" onClick={onMoveDown} aria-label={`Move ${label} down`} className="focus-ring interactive-control" style={smallButtonStyle}>↓</button>}{onEdit && <button type="button" onClick={onEdit} className="focus-ring interactive-control" style={smallButtonStyle}>Edit</button>}{onEditLimit && <button type="button" onClick={onEditLimit} className="focus-ring interactive-control" style={smallButtonStyle}>Limit</button>}{onArchive && <button type="button" onClick={onArchive} className="focus-ring interactive-control" style={smallButtonStyle}>Archive</button>}{onRestore && <button type="button" onClick={onRestore} className="focus-ring interactive-control" style={smallButtonStyle}>Restore</button>}</div>
  </article>
}

const labelStyle = { display: 'block', marginBottom: 6, color: 'var(--sub)', ...typographyRoles.labelButton }
const sectionLabelStyle = { margin: '16px 0 8px', color: 'var(--sub)', ...typographyRoles.labelButton }
const inputStyle = { width: '100%', boxSizing: 'border-box' as const, minHeight: 44, padding: '0 12px', background: 'var(--surface-recessed)', border: '1px solid var(--border)', borderRadius: radius.control, color: 'var(--text)', ...typographyRoles.body }
const primaryButtonStyle = { minHeight: 44, padding: '0 14px', background: 'var(--accent)', color: 'var(--text)', border: '1px solid var(--accent)', borderRadius: radius.control, cursor: 'pointer', ...typographyRoles.labelButton }
const secondaryButtonStyle = { minHeight: 44, padding: '0 14px', background: 'var(--surface-raised)', color: 'var(--sub)', border: '1px solid var(--border)', borderRadius: radius.control, cursor: 'pointer', ...typographyRoles.labelButton }
const headingStyle = { margin: '0 0 8px', color: 'var(--text)', ...typographyRoles.sectionHeadline }
const mutedBodyStyle = { margin: '0 0 12px', color: 'var(--muted)', ...typographyRoles.caption }
const listStyle = { display: 'flex', flexDirection: 'column' as const, gap: 8 }
const smallButtonStyle = { minHeight: 36, padding: '0 9px', background: 'transparent', color: 'var(--sub)', border: '1px solid var(--border)', borderRadius: radius.control, cursor: 'pointer', ...typographyRoles.labelButton }
