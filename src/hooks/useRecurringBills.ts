"use client"

import { useState, useEffect, useCallback } from "react"
import type { FixedExpense, RecurringCharge } from "@/lib/fixedExpenses"
import {
  createRecurringCharge,
  getRecurringCharges,
  updateRecurringCharge,
  type RecurringChargeInput,
} from "@/lib/supabaseData"

const STORAGE_KEY = "folio-recurring-bills"

function isoDateForDueDay(dueDay: number): string {
  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth(), Math.max(1, Math.min(28, dueDay)))
  return date.toISOString().slice(0, 10)
}

/** Converts pre-6.1 localStorage bills into complete recurring-charge records. */
function normalizeBill(bill: FixedExpense, userId: string): RecurringCharge {
  return {
    ...bill,
    id: bill.id || crypto.randomUUID(),
    userId: bill.userId || userId,
    recurringId: bill.recurringId || bill.id || crypto.randomUUID(),
    dueDay: bill.dueDay || 1,
    frequency: bill.frequency ?? "monthly",
    nextDueDate: bill.nextDueDate ?? isoDateForDueDay(bill.dueDay || 1),
    obligationType: bill.obligationType ?? (bill.category === "rent" ? "fixed" : "variable"),
    isSubscription: bill.isSubscription ?? bill.category === "subscriptions",
    isFlaggedUnused: bill.isFlaggedUnused ?? false,
    isActive: bill.isActive !== false,
  }
}

function toInput(bill: RecurringCharge): RecurringChargeInput {
  const { id: _id, userId: _userId, recurringId: _recurringId, dueDay: _dueDay, ...input } = bill
  return input
}

/**
 * First-class recurring-charge store. It reads/writes Supabase when the
 * migration is available and keeps the previous localStorage payload as an
 * offline fallback and one-time compatibility bridge.
 */
export function useRecurringBills(userId: string | null | undefined) {
  const [bills, setBills] = useState<RecurringCharge[]>([])
  const [loaded, setLoaded] = useState(false)

  const persistLocal = useCallback((next: RecurringCharge[]) => {
    setBills(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* best effort */ }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    let cancelled = false
    const load = async () => {
      let legacy: RecurringCharge[] = []
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw && userId) {
          legacy = (JSON.parse(raw) as FixedExpense[])
            .filter(bill => !bill.userId || bill.userId === userId)
            .map(bill => normalizeBill(bill, userId))
        }
      } catch { /* corrupted legacy data starts fresh */ }

      const remote = userId ? await getRecurringCharges(userId) : []
      if (cancelled) return
      // A non-empty remote source is canonical. Keep old local data when an
      // offline/development database has no migrated table yet.
      persistLocal(remote.length > 0 ? remote : legacy)
      setLoaded(true)
    }
    void load()
    return () => { cancelled = true }
  }, [userId, persistLocal])

  const addBill = useCallback(async (bill: Omit<FixedExpense, "id" | "userId">) => {
    const normalized = normalizeBill({ ...bill, id: crypto.randomUUID(), userId: userId ?? "" }, userId ?? "")
    const remote = userId ? await createRecurringCharge(userId, toInput(normalized)) : null
    persistLocal([...bills, remote ?? normalized])
  }, [bills, persistLocal, userId])

  const updateBill = useCallback(async (id: string, updates: Partial<FixedExpense>) => {
    const existing = bills.find(bill => bill.id === id)
    if (!existing) return
    const merged = normalizeBill({ ...existing, ...updates }, userId ?? existing.userId)
    const remote = userId ? await updateRecurringCharge(userId, id, toInput(merged)) : null
    persistLocal(bills.map(bill => bill.id === id ? (remote ?? merged) : bill))
  }, [bills, persistLocal, userId])

  /** Preserve historical links; removal from the screen is a soft deactivate. */
  const deleteBill = useCallback(async (id: string) => {
    const remote = userId ? await updateRecurringCharge(userId, id, { isActive: false }) : null
    persistLocal(bills.map(bill => bill.id === id ? (remote ?? { ...bill, isActive: false }) : bill))
  }, [bills, persistLocal, userId])

  return { bills, loaded, addBill, updateBill, deleteBill }
}
