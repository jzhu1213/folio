"use client"

import { useMemo, useState } from 'react'
import type { CustomCategory } from '@/types/folio'
import { ListRow } from '@/components/ui/primitives/ListRow'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import {
  Illustration,
  ILLUSTRATION_LABELS,
  type IllustrationName,
} from '@/components/ui/illustrations'
import { categoryPalette } from '@/styles/chartTokens'
import { shadows } from '@/styles/shared'
import { FONT_FAMILY, typographyRoles, spacing } from '@/styles/typography'
import { radius } from '@/styles/surfaces'

type CategoryUpdate = {
  label?: string
  illustration?: string
  color?: string
  archived?: boolean
}

export interface CategoryManagementScreenProps {
  customCategories: CustomCategory[]
  onAddCustomCategory: (label: string, emoji: string, icon?: string, options?: { illustration?: string; color?: string }) => Promise<CustomCategory | null>
  onUpdateCustomCategory: (id: string, updates: CategoryUpdate) => Promise<CustomCategory | null>
  onClose: () => void
}

const ILLUSTRATION_OPTIONS = Object.keys(ILLUSTRATION_LABELS) as IllustrationName[]
const COLOR_SWATCHES = Array.from(new Set(Object.values(categoryPalette))).filter(
  (color) => color !== categoryPalette.fallback,
)

function illustrationFor(category: CustomCategory): IllustrationName {
  return ILLUSTRATION_OPTIONS.includes(category.illustration as IllustrationName)
    ? category.illustration as IllustrationName
    : 'category:miscellaneous'
}

function SwatchPicker({ value, onChange, label }: { value: string; onChange: (color: string) => void; label: string }) {
  return (
    <div role="group" aria-label={label} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {COLOR_SWATCHES.map((color) => {
        const selected = value === color
        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            aria-label={`Use category color ${color}`}
            aria-pressed={selected}
            className="focus-ring interactive-control"
            style={{
              width: 32,
              height: 32,
              borderRadius: radius.full,
              background: color,
              border: selected ? '3px solid var(--text)' : '1px solid var(--border)',
              boxShadow: selected ? shadows.sm : 'none',
              cursor: 'pointer',
            }}
          />
        )
      })}
    </div>
  )
}

function IllustrationPicker({ value, onChange, label }: { value: IllustrationName; onChange: (name: IllustrationName) => void; label: string }) {
  return (
    <div role="group" aria-label={label} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(72px, 1fr))', gap: 8 }}>
      {ILLUSTRATION_OPTIONS.map((name) => {
        const selected = value === name
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            aria-label={`Use ${ILLUSTRATION_LABELS[name]} illustration`}
            aria-pressed={selected}
            className="focus-ring interactive-control"
            style={{
              minHeight: 72,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: selected ? 'var(--accent-muted)' : 'var(--surface-recessed)',
              border: selected ? '2px solid var(--accent)' : '1px solid var(--border)',
              borderRadius: radius.control,
              cursor: 'pointer',
            }}
          >
            <Illustration name={name} size={40} />
          </button>
        )
      })}
    </div>
  )
}

export function CategoryManagementScreen({ customCategories, onAddCustomCategory, onUpdateCustomCategory, onClose }: CategoryManagementScreenProps) {
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_SWATCHES[0])
  const [illustration, setIllustration] = useState<IllustrationName>('category:miscellaneous')
  const [saving, setSaving] = useState(false)

  const activeCategories = useMemo(() => customCategories.filter((category) => !category.archived), [customCategories])
  const archivedCategories = useMemo(() => customCategories.filter((category) => category.archived), [customCategories])

  const beginCreate = () => {
    setName('')
    setColor(COLOR_SWATCHES[0])
    setIllustration('category:miscellaneous')
    setEditingId(null)
    setCreating(true)
  }

  const beginEdit = (category: CustomCategory) => {
    setName(category.label)
    setColor(category.color && COLOR_SWATCHES.includes(category.color) ? category.color : COLOR_SWATCHES[0])
    setIllustration(illustrationFor(category))
    setCreating(false)
    setEditingId(category.id)
  }

  const save = async () => {
    const label = name.trim()
    if (!label || saving) return
    setSaving(true)
    try {
      if (creating) {
        const result = await onAddCustomCategory(label, '•', undefined, { illustration, color })
        if (result) setCreating(false)
      } else if (editingId) {
        const result = await onUpdateCustomCategory(editingId, { label, illustration, color })
        if (result) setEditingId(null)
      }
    } finally {
      setSaving(false)
    }
  }

  const editorOpen = creating || editingId !== null

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px 120px', fontFamily: FONT_FAMILY }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
        <button type="button" onClick={onClose} aria-label="Close category management" className="focus-ring interactive-control" style={{ width: 44, height: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: radius.full, cursor: 'pointer' }}>
          <Icon name="action:close" size={18} strokeWidth={1.5} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, color: 'var(--text)', ...typographyRoles.screenTitle }}>Your categories</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--sub)', ...typographyRoles.body }}>Create and tailor the categories you use most.</p>
        </div>
        <button type="button" onClick={beginCreate} className="focus-ring interactive-control" style={{ minHeight: 44, padding: '0 14px', background: 'var(--accent)', color: 'var(--text)', border: '1px solid var(--accent)', borderRadius: radius.control, cursor: 'pointer', ...typographyRoles.labelButton }}>New</button>
      </header>

      {editorOpen && (
        <section aria-labelledby="category-editor-title" style={{ marginBottom: spacing.lg, padding: 16, background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: radius.card, boxShadow: shadows.sm }}>
          <h2 id="category-editor-title" style={{ margin: '0 0 12px', color: 'var(--text)', ...typographyRoles.cardHeadline }}>{creating ? 'New category' : 'Edit category'}</h2>
          <label htmlFor="custom-category-name" style={{ display: 'block', marginBottom: 6, color: 'var(--sub)', ...typographyRoles.labelButton }}>Name</label>
          <input id="custom-category-name" value={name} onChange={(event) => setName(event.target.value.slice(0, 30))} onKeyDown={(event) => { if (event.key === 'Enter') void save() }} maxLength={30} autoFocus className="focus-ring interactive-field" style={{ width: '100%', boxSizing: 'border-box', minHeight: 44, padding: '0 12px', background: 'var(--surface-recessed)', border: '1px solid var(--border)', borderRadius: radius.control, color: 'var(--text)', ...typographyRoles.body }} />
          <p style={{ margin: '16px 0 8px', color: 'var(--sub)', ...typographyRoles.labelButton }}>Chart color</p>
          <SwatchPicker value={color} onChange={setColor} label="Choose a chart category color" />
          <p style={{ margin: '16px 0 8px', color: 'var(--sub)', ...typographyRoles.labelButton }}>Illustration</p>
          <IllustrationPicker value={illustration} onChange={setIllustration} label="Choose a category illustration" />
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button type="button" onClick={() => void save()} disabled={!name.trim() || saving} className="focus-ring interactive-control" style={{ minHeight: 44, padding: '0 14px', background: name.trim() ? 'var(--accent)' : 'var(--surface-recessed)', color: 'var(--text)', border: '1px solid var(--accent)', borderRadius: radius.control, cursor: name.trim() ? 'pointer' : 'not-allowed', ...typographyRoles.labelButton }}>{saving ? 'Saving…' : 'Save category'}</button>
            <button type="button" onClick={() => { setCreating(false); setEditingId(null) }} className="focus-ring interactive-control" style={{ minHeight: 44, padding: '0 14px', background: 'var(--surface-raised)', color: 'var(--sub)', border: '1px solid var(--border)', borderRadius: radius.control, cursor: 'pointer', ...typographyRoles.labelButton }}>Cancel</button>
          </div>
        </section>
      )}

      <section aria-labelledby="active-custom-categories">
        <h2 id="active-custom-categories" style={{ margin: '0 0 8px', color: 'var(--text)', ...typographyRoles.sectionHeadline }}>Custom categories</h2>
        {activeCategories.length === 0 ? (
          <EmptyState illustration={<Illustration name="category:miscellaneous" size={48} />} title="Make this yours" subtitle="Add a category for the spending that matters to you." actionLabel="Create category" onAction={beginCreate} actionAriaLabel="Create a custom category" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeCategories.map((category) => (
              <ListRow key={category.id} aria-label={`${category.label} custom category`} style={{ padding: '0 12px', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: radius.card }}>
                <Illustration name={illustrationFor(category)} size={40} />
                <div style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
                  <p style={{ margin: 0, color: 'var(--text)', ...typographyRoles.cardHeadline }}>{category.label}</p>
                  <p style={{ margin: '2px 0 0', color: 'var(--muted)', ...typographyRoles.caption }}>Custom category</p>
                </div>
                <span aria-label={`Color ${category.color ?? COLOR_SWATCHES[0]}`} style={{ width: 18, height: 18, borderRadius: radius.full, background: category.color ?? COLOR_SWATCHES[0], border: '1px solid var(--border)', marginRight: 8 }} />
                <button type="button" onClick={() => beginEdit(category)} className="focus-ring interactive-control" style={{ minHeight: 40, padding: '0 10px', background: 'transparent', color: 'var(--sub)', border: '1px solid var(--border)', borderRadius: radius.control, cursor: 'pointer', ...typographyRoles.labelButton }}>Edit</button>
                <button type="button" onClick={() => void onUpdateCustomCategory(category.id, { archived: true })} className="focus-ring interactive-control" style={{ minHeight: 40, marginLeft: 8, padding: '0 10px', background: 'transparent', color: 'var(--sub)', border: '1px solid var(--border)', borderRadius: radius.control, cursor: 'pointer', ...typographyRoles.labelButton }}>Archive</button>
              </ListRow>
            ))}
          </div>
        )}
      </section>

      {archivedCategories.length > 0 && (
        <section aria-labelledby="archived-custom-categories" style={{ marginTop: spacing.xl }}>
          <h2 id="archived-custom-categories" style={{ margin: '0 0 8px', color: 'var(--sub)', ...typographyRoles.sectionHeadline }}>Archived</h2>
          <p style={{ margin: '0 0 8px', color: 'var(--muted)', ...typographyRoles.caption }}>Archived categories stay in your records and can be restored anytime.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {archivedCategories.map((category) => (
              <ListRow key={category.id} aria-label={`${category.label} archived custom category`} style={{ padding: '0 12px', opacity: 0.72, background: 'var(--surface-recessed)', border: '1px solid var(--border)', borderRadius: radius.card }}>
                <Illustration name={illustrationFor(category)} size={40} />
                <div style={{ flex: 1, marginLeft: 12 }}><p style={{ margin: 0, color: 'var(--text)', ...typographyRoles.cardHeadline }}>{category.label}</p></div>
                <button type="button" onClick={() => void onUpdateCustomCategory(category.id, { archived: false })} className="focus-ring interactive-control" style={{ minHeight: 40, padding: '0 10px', background: 'var(--surface-raised)', color: 'var(--sub)', border: '1px solid var(--border)', borderRadius: radius.control, cursor: 'pointer', ...typographyRoles.labelButton }}>Restore</button>
              </ListRow>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
