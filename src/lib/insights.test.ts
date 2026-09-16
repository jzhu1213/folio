import { describe, expect, it } from 'vitest'
import type { Budget, Transaction, TransactionCategory } from '@/types'
import {
  MAX_RANKED_INSIGHTS,
  detectSpike,
  getCategoryDelta,
  getInsights,
  getPaceVsBudget,
  rankInsights,
} from './insights'
import type { Insight } from './insights'

let transactionNumber = 0

function expense(date: string, amount: number, category: TransactionCategory = 'food'): Transaction {
  transactionNumber += 1
  return {
    id: `transaction-${transactionNumber}`,
    userId: 'user-1',
    date,
    amount,
    type: 'expense',
    category,
    accountType: 'personal',
    createdAt: `${date}T12:00:00`,
  }
}

function insight(id: string, type: Insight['type'], magnitude: number): Insight {
  return {
    id,
    type,
    category: 'food',
    direction: 'up',
    magnitude,
    sentence: `A useful ${id} insight.`,
  }
}

function budget(category: TransactionCategory, monthlyLimit: number): Budget {
  return {
    id: `budget-${category}`,
    userId: 'user-1',
    category,
    monthlyLimit,
    spent: 0,
    month: '2024-03',
  }
}

describe('insights', () => {
  it('calculates a normal week-over-week category delta', () => {
    const transactions = [
      expense('2024-03-04', 50),
      expense('2024-03-06', 50),
      expense('2024-03-11', 60),
      expense('2024-03-13', 60),
    ]

    const result = getCategoryDelta(transactions, 'food', {
      unit: 'week',
      asOf: new Date(2024, 2, 14),
    })

    expect(result).toMatchObject({
      type: 'category_delta',
      direction: 'up',
      magnitude: 20,
      currentSpend: 120,
      priorSpend: 100,
      sentence: 'You spent 20% more on Food this week.',
    })
  })

  it('flags a category transaction that is more than twice its trailing four-week average', () => {
    const result = detectSpike([
      expense('2024-03-01', 10),
      expense('2024-03-05', 12),
      expense('2024-03-10', 11),
      expense('2024-03-15', 9),
      expense('2024-03-20', 80),
    ], 'food')

    expect(result).toMatchObject({
      type: 'spike',
      category: 'food',
      direction: 'up',
      magnitude: 80,
      source: 'transaction',
    })
    expect(result?.sentence).toContain('$80')
  })

  it('projects an individual budget line using Monthly Runway pace math', () => {
    const result = getPaceVsBudget([
      expense('2024-03-01', 30),
      expense('2024-03-02', 30),
      expense('2024-03-03', 30),
    ], budget('food', 200), {
      daysElapsed: 3,
      daysInMonth: 31,
    })

    expect(result).toMatchObject({
      type: 'pace',
      spentSoFar: 90,
      dailyPace: 30,
      projectedSpend: 930,
      projectedRemaining: -730,
      magnitude: 730,
      cumulativeSpend: [30, 60, 90],
    })
  })

  it('excludes category deltas when either comparison period has too little data', () => {
    const result = getCategoryDelta([
      expense('2024-03-04', 50),
      expense('2024-03-11', 100),
    ], 'food', {
      unit: 'week',
      asOf: new Date(2024, 2, 14),
    })

    expect(result).toBeNull()
  })

  it('returns no ranked insights for a brand-new account without a prior comparison period', () => {
    const result = getInsights([
      expense('2024-01-01', 24),
      expense('2024-01-02', 31),
    ], [], { asOf: new Date(2024, 0, 3) })

    expect(result).toEqual([])
  })

  it('silently excludes a category that has transactions only in the current month', () => {
    const transactions = [
      expense('2024-03-01', 24),
      expense('2024-03-02', 31),
    ]

    expect(getCategoryDelta(transactions, 'food', {
      unit: 'month',
      asOf: new Date(2024, 2, 3),
    })).toBeNull()
    expect(getInsights(transactions, [], { asOf: new Date(2024, 2, 3) }))
      .not.toContainEqual(expect.objectContaining({ type: 'category_delta', category: 'food' }))
  })

  it('ranks pace first, then percent deltas, then spikes, and trims the rest', () => {
    const ranked = rankInsights([
      insight('spike', 'spike', 500),
      insight('delta-small', 'category_delta', 18),
      insight('pace', 'pace', 12),
      insight('delta-large', 'category_delta', 45),
      insight('delta-medium', 'category_delta', 30),
      insight('extra-spike', 'spike', 900),
    ])

    expect(ranked).toHaveLength(MAX_RANKED_INSIGHTS)
    expect(ranked.map((item) => item.id)).toEqual([
      'pace',
      'delta-large',
      'delta-medium',
      'delta-small',
    ])
  })
})
