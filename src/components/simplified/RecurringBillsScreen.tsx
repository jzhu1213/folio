"use client"

import { useMemo, useState } from "react"
import { motion } from "motion/react"
import { EmptyState } from "@/components/ui/EmptyState"
import { GlassCard } from "@/components/ui/GlassCard"
import { BUDGET_CATEGORIES, type TransactionCategory } from "@/types"
import type { FixedExpense, RecurringCharge, RecurringChargeFrequency, RecurringObligationType } from "@/lib/fixedExpenses"
import { FONT_FAMILY, fontWeights, spacing, typography } from "@/styles/typography"
import { CONTENT_MAX_WIDTH, HORIZONTAL_PADDING, borderRadius, fills, sectionHeader } from "@/styles/shared"
import { radius } from "@/styles/surfaces"
import { springs } from "@/lib/animations"

export interface RecurringBillsScreenProps {
  bills: RecurringCharge[]
  /** Retained for the Phase 6.3 creation flow; this screen intentionally has no add entry point. */
  onAddBill: (bill: Omit<FixedExpense, "id" | "userId">) => Promise<void>
  onUpdateBill: (id: string, bill: Partial<FixedExpense>) => Promise<void>
  onDeleteBill: (id: string) => Promise<void>
  onClose: () => void
}

const FREQUENCIES: Array<{ value: RecurringChargeFrequency; label: string }> = [
  { value: "weekly", label: "Weekly" }, { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" }, { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
]

function categoryMeta(category: TransactionCategory) {
  return BUDGET_CATEGORIES.find(item => item.category === category) ?? BUDGET_CATEGORIES[BUDGET_CATEGORIES.length - 1]
}

function frequencyLabel(frequency: RecurringChargeFrequency) {
  return FREQUENCIES.find(option => option.value === frequency)?.label ?? "Monthly"
}

function monthlyEquivalent(charge: RecurringCharge): number {
  switch (charge.frequency) {
    case "weekly": return charge.amount * 52 / 12
    case "biweekly": return charge.amount * 26 / 12
    case "quarterly": return charge.amount / 3
    case "yearly": return charge.amount / 12
    default: return charge.amount
  }
}

/**
 * Fixed obligations and variable recurring spending are intentionally separated.
 * Subscription rows receive their own renewal-focused treatment in Phase 6.2.
 */
export function RecurringBillsScreen({ bills, onAddBill, onUpdateBill, onDeleteBill, onClose }: RecurringBillsScreenProps) {
  const [editing, setEditing] = useState<RecurringCharge | null>(null)
  const [creating, setCreating] = useState(false)
  const active = bills.filter(charge => charge.isActive)
  const fixed = active.filter(charge => charge.obligationType === "fixed")
  const variable = active.filter(charge => charge.obligationType === "variable")
  const subscriptions = fixed
    .filter(charge => charge.isSubscription)
    .sort((left, right) => left.nextDueDate.localeCompare(right.nextDueDate))
  const nonSubscriptionFixed = fixed.filter(charge => !charge.isSubscription)
  const fixedMonthly = useMemo(() => fixed.reduce((total, charge) => total + monthlyEquivalent(charge), 0), [fixed])

  return (
    <main style={{ maxWidth: CONTENT_MAX_WIDTH, margin: "0 auto", padding: `0 ${HORIZONTAL_PADDING}px 48px`, fontFamily: FONT_FAMILY }}>
      <header style={{ display: "flex", alignItems: "center", gap: spacing.sm, padding: "16px 0 18px" }}>
        <button type="button" onClick={onClose} aria-label="Go back" style={backButtonStyle}>←</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: typography.headline.fontSize, fontWeight: fontWeights.bold, color: "var(--text)" }}>Recurring</h1>
          <p style={{ margin: "2px 0 0", fontSize: typography["body-sm"].fontSize, color: "var(--sub)" }}>Your ongoing commitments</p>
        </div>
        <button type="button" onClick={() => setCreating(true)} style={addButtonStyle}>Add charge</button>
      </header>

      {active.length === 0 ? (
        <EmptyState
          illustration="budget"
          title="No recurring charges yet"
          subtitle="Recurring charges you set up later will appear here, separate from everyday spending."
          actionLabel="Add recurring charge"
          onAction={() => setCreating(true)}
          actionColor="accent"
          analyticsContext="recurring_charges_empty"
        />
      ) : (
        <>
          <GlassCard elevation="low" style={{ padding: "18px 20px", marginBottom: spacing.lg }}>
            <p style={sectionHeader}>Fixed commitments</p>
            <p style={{ margin: "2px 0 0", color: "var(--text)", fontSize: typography.headline.fontSize, fontWeight: fontWeights.bold, fontVariantNumeric: "tabular-nums" }}>
              ${fixedMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}<span style={{ color: "var(--sub)", fontWeight: fontWeights.regular, fontSize: typography["body-sm"].fontSize }}> / month</span>
            </p>
            <p style={{ margin: "5px 0 0", color: "var(--muted)", fontSize: typography["body-sm"].fontSize }}>
              {fixed.length} fixed obligation{fixed.length === 1 ? "" : "s"} reserved before variable spending.
            </p>
          </GlassCard>

          <FixedObligationSection
            subscriptions={subscriptions}
            fixedCharges={nonSubscriptionFixed}
            onEdit={setEditing}
            onDeactivate={onDeleteBill}
            onToggleUnused={charge => void onUpdateBill(charge.id, { isFlaggedUnused: !charge.isFlaggedUnused })}
          />
          <ChargeSection title="Variable recurring" description="Recurring costs whose amount or timing can vary, such as utilities." charges={variable} onEdit={setEditing} onDeactivate={onDeleteBill} />
        </>
      )}

      {editing && <EditChargeSheet charge={editing} onCancel={() => setEditing(null)} onSave={async updates => { await onUpdateBill(editing.id, updates); setEditing(null) }} />}
      {creating && <EditChargeSheet isNew charge={newChargeDraft()} onCancel={() => setCreating(false)} onSave={async updates => {
        await onAddBill({
          label: updates.label!, amount: updates.amount!, category: updates.category!, frequency: updates.frequency!,
          nextDueDate: updates.nextDueDate!, obligationType: updates.obligationType!, isSubscription: updates.isSubscription!,
          isFlaggedUnused: false, dueDay: Number.parseInt(updates.nextDueDate!.slice(-2), 10), recurringId: crypto.randomUUID(), isActive: true,
        })
        setCreating(false)
      }} />}
    </main>
  )
}

function FixedObligationSection({ subscriptions, fixedCharges, onEdit, onDeactivate, onToggleUnused }: {
  subscriptions: RecurringCharge[]; fixedCharges: RecurringCharge[]; onEdit: (charge: RecurringCharge) => void; onDeactivate: (id: string) => Promise<void>; onToggleUnused: (charge: RecurringCharge) => void
}) {
  return (
    <section style={{ marginBottom: spacing.xl }} aria-label="Fixed obligations">
      <h2 style={{ ...sectionHeader, margin: 0 }}>Fixed obligations</h2>
      <p style={{ margin: "4px 0 10px", color: "var(--muted)", fontSize: typography["body-sm"].fontSize }}>Predictable costs reserved before variable spending.</p>
      {subscriptions.length > 0 && (
        <>
          <p style={{ ...sectionHeader, margin: "14px 0 8px", color: "var(--sub)" }}>Subscriptions</p>
          <GlassCard elevation="low" style={{ padding: "0 16px", marginBottom: spacing.sm }}>
            {subscriptions.map(charge => <SubscriptionChargeRow key={charge.id} charge={charge} onEdit={() => onEdit(charge)} onDeactivate={() => onDeactivate(charge.id)} onToggleUnused={() => onToggleUnused(charge)} />)}
          </GlassCard>
        </>
      )}
      {fixedCharges.length > 0 && (
        <>
          {subscriptions.length > 0 && <p style={{ ...sectionHeader, margin: "14px 0 8px", color: "var(--sub)" }}>Other fixed costs</p>}
          <GlassCard elevation="low" style={{ padding: "0 16px" }}>
            {fixedCharges.map(charge => <ChargeRow key={charge.id} charge={charge} onEdit={() => onEdit(charge)} onDeactivate={() => onDeactivate(charge.id)} />)}
          </GlassCard>
        </>
      )}
      {subscriptions.length === 0 && fixedCharges.length === 0 && <div style={{ padding: "14px 16px", borderRadius: radius.control, background: fills[3], color: "var(--muted)", fontSize: typography["body-sm"].fontSize }}>None set up yet.</div>}
    </section>
  )
}

function ChargeSection({ title, description, charges, onEdit, onDeactivate }: {
  title: string; description: string; charges: RecurringCharge[]; onEdit: (charge: RecurringCharge) => void; onDeactivate: (id: string) => Promise<void>
}) {
  return (
    <section style={{ marginBottom: spacing.xl }} aria-label={title}>
      <h2 style={{ ...sectionHeader, margin: 0 }}>{title}</h2>
      <p style={{ margin: "4px 0 10px", color: "var(--muted)", fontSize: typography["body-sm"].fontSize }}>{description}</p>
      {charges.length === 0 ? (
        <div style={{ padding: "14px 16px", borderRadius: radius.control, background: fills[3], color: "var(--muted)", fontSize: typography["body-sm"].fontSize }}>None set up yet.</div>
      ) : (
        <GlassCard elevation="low" style={{ padding: "0 16px" }}>
          {charges.map(charge => <ChargeRow key={charge.id} charge={charge} onEdit={() => onEdit(charge)} onDeactivate={() => onDeactivate(charge.id)} />)}
        </GlassCard>
      )}
    </section>
  )
}

function ChargeRow({ charge, onEdit, onDeactivate }: { charge: RecurringCharge; onEdit: () => void; onDeactivate: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false)
  const category = categoryMeta(charge.category)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
      <button type="button" onClick={onEdit} aria-label={`Edit ${charge.label}`} style={{ ...iconButtonStyle, background: "var(--fill-05)" }}>{category.emoji}</button>
      <button type="button" onClick={onEdit} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: FONT_FAMILY }}>
        <p style={{ margin: 0, color: "var(--text)", fontSize: typography.body.fontSize, fontWeight: fontWeights.medium }}>{charge.label}</p>
        <p style={{ margin: "2px 0 0", color: "var(--muted)", fontSize: typography["body-sm"].fontSize }}>{category.label} · {frequencyLabel(charge.frequency)}</p>
      </button>
      <div style={{ textAlign: "right" }}>
        <p style={{ margin: 0, color: "var(--text)", fontSize: typography.body.fontSize, fontWeight: fontWeights.semibold, fontVariantNumeric: "tabular-nums" }}>${charge.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        {confirming ? <button type="button" onClick={() => void onDeactivate()} style={deactivateButtonStyle}>Deactivate</button> : <button type="button" onClick={() => setConfirming(true)} style={quietButtonStyle}>•••</button>}
      </div>
    </div>
  )
}

function SubscriptionChargeRow({ charge, onEdit, onDeactivate, onToggleUnused }: { charge: RecurringCharge; onEdit: () => void; onDeactivate: () => Promise<void>; onToggleUnused: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const category = categoryMeta(charge.category)
  const renewal = renewalLabel(charge.nextDueDate)
  const monthlyCost = monthlyEquivalent(charge)
  const muted = charge.isFlaggedUnused
  return (
    <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, padding: "14px 0", borderBottom: "1px solid var(--border)", opacity: muted ? .68 : 1 }}>
      <button type="button" onClick={onEdit} aria-label={`Edit ${charge.label}`} style={{ ...iconButtonStyle, width: 42, height: 42, background: "var(--fill-05)", fontSize: 20 }}>{category.emoji}</button>
      <button type="button" onClick={onEdit} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: FONT_FAMILY }}>
        <p style={{ margin: 0, color: "var(--text)", fontSize: typography.body.fontSize, fontWeight: fontWeights.semibold }}>{charge.label}</p>
        <p style={{ margin: "2px 0 0", color: muted ? "var(--muted)" : "var(--sub)", fontSize: typography["body-sm"].fontSize, fontWeight: fontWeights.medium }}>{renewal}</p>
        {muted && <span style={{ display: "inline-block", marginTop: 5, padding: "2px 6px", borderRadius: borderRadius.full, background: "var(--fill-05)", color: "var(--muted)", fontSize: typography.caption.fontSize }}>Marked unused</span>}
      </button>
      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
        <p style={{ margin: 0, color: "var(--text)", fontSize: typography.body.fontSize, fontWeight: fontWeights.semibold, fontVariantNumeric: "tabular-nums" }}>${monthlyCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}<span style={{ color: "var(--muted)", fontSize: typography.caption.fontSize, fontWeight: fontWeights.regular }}>/mo</span></p>
        <button type="button" onClick={onToggleUnused} style={subscriptionActionStyle} aria-label={`${muted ? "Unflag" : "Flag"} ${charge.label} as unused`}>{muted ? "Unflag" : "Flag unused"}</button>
        {confirming ? <button type="button" onClick={() => void onDeactivate()} style={deactivateButtonStyle}>Deactivate</button> : <button type="button" onClick={() => setConfirming(true)} style={quietButtonStyle} aria-label={`More actions for ${charge.label}`}>•••</button>}
      </div>
    </div>
  )
}

function renewalLabel(nextDueDate: string): string {
  const today = new Date()
  const renewal = new Date(`${nextDueDate}T00:00:00`)
  const days = Math.round((new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() - renewal.getTime()) / -86400000)
  if (days === 0) return "Renews today"
  if (days === 1) return "Renews tomorrow"
  if (days > 1) return `Renews in ${days} days`
  if (days === -1) return "Renewed yesterday"
  return "Renewal date passed"
}

function EditChargeSheet({ charge, isNew = false, onCancel, onSave }: { charge: RecurringCharge; isNew?: boolean; onCancel: () => void; onSave: (updates: Partial<RecurringCharge>) => Promise<void> }) {
  const [form, setForm] = useState(charge)
  const [saving, setSaving] = useState(false)
  async function save() { if (!form.label.trim() || form.amount <= 0) return; setSaving(true); try { await onSave({ label: form.label.trim(), amount: form.amount, category: form.category, frequency: form.frequency, nextDueDate: form.nextDueDate, obligationType: form.obligationType, isSubscription: form.isSubscription }) } finally { setSaving(false) } }
  return (
    <div role="dialog" aria-modal="true" aria-label={isNew ? "Add recurring charge" : `Edit ${charge.label}`} style={sheetBackdropStyle}>
      <GlassCard elevation="high" style={sheetStyle}>
        <h2 style={{ margin: "0 0 16px", color: "var(--text)", fontSize: typography.subhead.fontSize }}>{isNew ? "Add recurring charge" : "Edit recurring charge"}</h2>
        <Field label="Name"><input value={form.label} onChange={event => setForm({ ...form, label: event.target.value })} style={inputStyle} /></Field>
        <Field label="Amount"><input type="number" min="0" step="0.01" value={form.amount} onChange={event => setForm({ ...form, amount: Number(event.target.value) || 0 })} style={inputStyle} /></Field>
        <Field label="Category"><select value={form.category} onChange={event => setForm({ ...form, category: event.target.value as TransactionCategory })} style={inputStyle}>{BUDGET_CATEGORIES.map(category => <option key={category.category} value={category.category}>{category.emoji} {category.label}</option>)}</select></Field>
        <Field label="Frequency"><select value={form.frequency} onChange={event => setForm({ ...form, frequency: event.target.value as RecurringChargeFrequency })} style={inputStyle}>{FREQUENCIES.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
        <Field label="Next due date"><input type="date" value={form.nextDueDate} onChange={event => setForm({ ...form, nextDueDate: event.target.value })} style={inputStyle} /></Field>
        <Field label="Spending type"><select value={form.obligationType} onChange={event => setForm({ ...form, obligationType: event.target.value as RecurringObligationType })} style={inputStyle}><option value="fixed">Fixed obligation</option><option value="variable">Variable recurring</option></select></Field>
        <label style={{ display: "flex", alignItems: "center", gap: spacing.xs, marginBottom: 10, color: "var(--sub)", fontSize: typography["body-sm"].fontSize }}><input type="checkbox" checked={form.isSubscription} onChange={event => setForm({ ...form, isSubscription: event.target.checked, obligationType: event.target.checked ? "fixed" : form.obligationType })} /> Subscription</label>
        <div style={{ display: "flex", gap: spacing.sm, marginTop: spacing.md }}><button type="button" onClick={onCancel} style={{ ...actionButtonStyle, background: "var(--fill-05)", color: "var(--text)" }}>Cancel</button><motion.button type="button" onClick={() => void save()} disabled={saving} whileTap={{ scale: .98 }} transition={springs.snappy} style={{ ...actionButtonStyle, background: "var(--accent)", color: "white" }}>{saving ? "Saving…" : isNew ? "Add charge" : "Save changes"}</motion.button></div>
      </GlassCard>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label style={{ display: "block", marginBottom: 10, color: "var(--sub)", fontSize: typography["body-sm"].fontSize }}>{label}<div style={{ marginTop: 4 }}>{children}</div></label> }

function newChargeDraft(): RecurringCharge {
  const today = new Date()
  today.setMonth(today.getMonth() + 1)
  const nextDueDate = today.toISOString().slice(0, 10)
  return { id: "", userId: "", recurringId: "", label: "", amount: 0, category: "subscriptions", dueDay: today.getDate(), isActive: true, frequency: "monthly", nextDueDate, obligationType: "fixed", isSubscription: true, isFlaggedUnused: false }
}

const backButtonStyle: React.CSSProperties = { width: 36, height: 36, border: "1px solid var(--border)", borderRadius: borderRadius.full, background: "var(--fill-03)", color: "var(--text)", fontSize: 20, cursor: "pointer" }
const addButtonStyle: React.CSSProperties = { border: "none", borderRadius: borderRadius.full, padding: "9px 12px", background: "var(--accent)", color: "white", cursor: "pointer", fontFamily: FONT_FAMILY, fontSize: typography["body-sm"].fontSize, fontWeight: fontWeights.semibold }
const iconButtonStyle: React.CSSProperties = { width: 36, height: 36, border: "none", borderRadius: radius.control, fontSize: 17, cursor: "pointer" }
const quietButtonStyle: React.CSSProperties = { border: "none", background: "none", color: "var(--muted)", padding: "4px 0", cursor: "pointer", fontSize: 14 }
const deactivateButtonStyle: React.CSSProperties = { border: "none", background: "var(--error-100)", color: "var(--error)", borderRadius: radius.min, padding: "4px 6px", cursor: "pointer", fontSize: typography.caption.fontSize, fontWeight: fontWeights.semibold }
const subscriptionActionStyle: React.CSSProperties = { border: "none", borderRadius: radius.min, background: "var(--fill-05)", color: "var(--sub)", padding: "3px 6px", cursor: "pointer", fontFamily: FONT_FAMILY, fontSize: typography.caption.fontSize, fontWeight: fontWeights.medium }
const sheetBackdropStyle: React.CSSProperties = { position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16, background: "rgba(0,0,0,.35)" }
const sheetStyle: React.CSSProperties = { width: "min(100%, 480px)", padding: 20 }
const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: radius.control, background: "var(--color-sunken)", color: "var(--text)", fontFamily: FONT_FAMILY, fontSize: typography.body.fontSize }
const actionButtonStyle: React.CSSProperties = { flex: 1, border: "none", borderRadius: borderRadius.full, padding: "11px 14px", cursor: "pointer", fontFamily: FONT_FAMILY, fontSize: typography.body.fontSize, fontWeight: fontWeights.semibold }
