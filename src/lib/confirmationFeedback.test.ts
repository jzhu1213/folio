import { describe, expect, it } from 'vitest'
import type { Budget, Transaction } from '@/types'
import { buildExpenseConfirmation, buildTransactionChangeConfirmation } from './confirmationFeedback'

const now = new Date(2026, 8, 13)

function expense(date: string, amount: number): Transaction {
  return {
    id: `${date}-${amount}`,
    userId: 'user-1',
    date,
    amount,
    type: 'expense',
    category: 'food',
    accountType: 'personal',
    createdAt: '2026-09-13T12:00:00.000Z',
  }
}

function confirmation(overrides: Partial<Parameters<typeof buildExpenseConfirmation>[0]> = {}) {
  return buildExpenseConfirmation({
    amount: 10,
    category: 'food',
    categoryLabel: 'Dining hall',
    date: '2026-09-13',
    transactions: [expense('2026-09-05', 25)],
    budgets: [],
    dailyBudget: 20,
    now,
    ...overrides,
  })
}

describe('buildExpenseConfirmation', () => {
  it('prefers the matching category budget and includes the submitted amount', () => {
    const budget: Budget = {
      id: 'food-september',
      userId: 'user-1',
      category: 'food',
      monthlyLimit: 100,
      spent: 25,
      month: '2026-09',
    }

    expect(confirmation({ budgets: [budget] })).toContain('65.00 left in Dining hall this month.')
  })

  it('uses calm shortfall copy when the category budget is exceeded', () => {
    const budget: Budget = {
      id: 'food-september',
      userId: 'user-1',
      category: 'food',
      monthlyLimit: 30,
      spent: 25,
      month: '2026-09',
    }

    expect(confirmation({ budgets: [budget] })).toContain('You may be about')
    expect(confirmation({ budgets: [budget] })).toContain('short in Dining hall this month.')
  })

  it('includes an allowed backfilled expense in the Monthly Runway fallback', () => {
    const sameDay = confirmation()
    const backfilled = confirmation({ date: '2026-09-10' })

    expect(backfilled).toContain('left this month.')
    expect(backfilled).toBe(sameDay)
  })
})

describe('buildTransactionChangeConfirmation', () => {
  it('uses the post-edit collection without deducting an edited amount twice', () => {
    const updated = expense('2026-09-10', 40)
    const budget: Budget = {
      id: 'food-september', userId: 'user-1', category: 'food', monthlyLimit: 100, spent: 25, month: '2026-09',
    }

    expect(buildTransactionChangeConfirmation({
      action: 'updated', transaction: updated, categoryLabel: 'Dining hall',
      transactions: [updated], budgets: [budget], dailyBudget: 20, now,
    })).toContain('60.00 left in Dining hall this month.')
  })

  it('uses the post-delete collection when reporting remaining budget', () => {
    const deleted = expense('2026-09-10', 40)
    const budget: Budget = {
      id: 'food-september', userId: 'user-1', category: 'food', monthlyLimit: 100, spent: 25, month: '2026-09',
    }

    expect(buildTransactionChangeConfirmation({
      action: 'deleted', transaction: deleted, categoryLabel: 'Dining hall',
      transactions: [], budgets: [budget], dailyBudget: 20, now,
    })).toContain('75.00 left in Dining hall this month.')
  })
})
