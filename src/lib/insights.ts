import { BUDGET_CATEGORIES } from '@/types'
import type { Budget, Transaction, TransactionCategory } from '@/types'
import { getEffectiveMonthlyEquivalent } from '@/lib/budgetUtils'
import { formatDateLocal, getDaysInMonthLocal, parseDateLocal, subtractDaysLocal } from '@/lib/dateUtils'
import { formatCurrency } from '@/lib/currencyUtils'

// ============================================================================
// Tuning constants
// ============================================================================

/** A comparison needs enough activity in both windows to be trustworthy. */
export const MIN_TRANSACTIONS_PER_COMPARISON_PERIOD = 2

/** Days of category history used to establish a spike baseline. */
export const SPIKE_LOOKBACK_DAYS = 28

/** A spike needs several prior purchases before it can be meaningful. */
export const MIN_SPIKE_BASELINE_TRANSACTIONS = 4

/** A transaction or day must clear this multiple of its recent average. */
export const SPIKE_MULTIPLIER = 2

/** Small changes are described as steady rather than directional. */
export const NEUTRAL_DELTA_PERCENT = 3

/** Keep the home surface focused on a few decisions, not a statistics dump. */
export const MAX_RANKED_INSIGHTS = 4

/** These budget periods do not carry the cycle dates needed for a month-end pace. */
const UNSUPPORTED_MONTH_PACE_PERIODS = new Set<NonNullable<Budget['period']>>([
  'payday_aligned',
  'semester',
])

// ============================================================================
// Public types
// ============================================================================

export type InsightType = 'category_delta' | 'pace' | 'spike'
export type InsightDirection = 'up' | 'down' | 'neutral'
export type ComparisonPeriodUnit = 'week' | 'month'

/** A display-ready, decision-relevant observation about spending. */
export interface Insight {
  id: string
  type: InsightType
  category: TransactionCategory
  direction: InsightDirection
  /** Percent for category deltas; dollars for pace and spike insights. */
  magnitude: number
  /** Plain-language copy ready for an insight card. */
  sentence: string
}

/** Selects the calendar period and makes historical calculations deterministic. */
export interface CategoryDeltaPeriod {
  unit: ComparisonPeriodUnit
  /** Defaults to today when omitted. */
  asOf?: Date
}

/**
 * The portion of a calendar month that has elapsed. `daysElapsed` includes the
 * current day, mirroring the Monthly Runway calculation.
 */
export interface MonthProgress {
  daysElapsed: number
  daysInMonth: number
}

export interface CategoryDeltaInsight extends Insight {
  type: 'category_delta'
  currentSpend: number
  priorSpend: number
  period: ComparisonPeriodUnit
}

export interface PaceInsight extends Insight {
  type: 'pace'
  budgetAmount: number
  cumulativeSpend: number[]
  spentSoFar: number
  dailyPace: number
  projectedSpend: number
  projectedRemaining: number
  daysElapsed: number
  daysInMonth: number
}

export interface SpikeInsight extends Insight {
  type: 'spike'
  date: string
  transactionId?: string
  typicalAmount: number
  /** Whether the outlier was a transaction or the combined spend for a day. */
  source: 'transaction' | 'day'
}

export interface InsightEngineOptions {
  /** Defaults to today; pass this for a reproducible historical snapshot. */
  asOf?: Date
  deltaPeriod?: ComparisonPeriodUnit
}

// ============================================================================
// Insight generation
// ============================================================================

/**
 * Compares a category's week-to-date or month-to-date spending with the same
 * number of days in the preceding equivalent period. Returns `null` when either
 * period has too little activity for a useful comparison.
 */
export function getCategoryDelta(
  transactions: readonly Transaction[],
  category: TransactionCategory,
  period: ComparisonPeriodUnit | CategoryDeltaPeriod,
): CategoryDeltaInsight | null {
  const { unit, asOf = new Date() } = normalizeDeltaPeriod(period)
  const currentRange = getComparisonRange(unit, asOf)
  const priorRange = getPriorEquivalentRange(currentRange, unit)
  const currentTransactions = categoryExpensesInRange(transactions, category, currentRange)
  const priorTransactions = categoryExpensesInRange(transactions, category, priorRange)

  if (
    currentTransactions.length < MIN_TRANSACTIONS_PER_COMPARISON_PERIOD ||
    priorTransactions.length < MIN_TRANSACTIONS_PER_COMPARISON_PERIOD
  ) {
    return null
  }

  const currentSpend = sumAmounts(currentTransactions)
  const priorSpend = sumAmounts(priorTransactions)
  if (priorSpend <= 0) return null

  const rawPercent = ((currentSpend - priorSpend) / priorSpend) * 100
  const roundedPercent = Math.round(rawPercent)
  const direction: InsightDirection = Math.abs(roundedPercent) <= NEUTRAL_DELTA_PERCENT
    ? 'neutral'
    : roundedPercent > 0 ? 'up' : 'down'
  const magnitude = direction === 'neutral' ? 0 : Math.abs(roundedPercent)
  const label = getCategoryLabel(category)
  const periodLabel = unit === 'week' ? 'this week' : 'this month'

  return {
    id: `category-delta:${category}:${unit}:${formatDateLocal(asOf)}`,
    type: 'category_delta',
    category,
    direction,
    magnitude,
    sentence: direction === 'neutral'
      ? `Your ${label} spending is about the same ${periodLabel}.`
      : `You spent ${magnitude}% ${direction === 'up' ? 'more' : 'less'} on ${label} ${periodLabel}.`,
    currentSpend: roundMoney(currentSpend),
    priorSpend: roundMoney(priorSpend),
    period: unit,
  }
}

/**
 * Applies the Monthly Runway's cumulative-spend, daily-pace, and month-end
 * projection math to one budget line. It only returns an insight when that
 * category's projected month-end total is above its configured plan.
 */
export function getPaceVsBudget(
  transactions: readonly Transaction[],
  budget: Budget,
  monthProgress: MonthProgress,
): PaceInsight | null {
  const daysInMonth = Math.max(1, Math.floor(monthProgress.daysInMonth))
  const daysElapsed = Math.min(daysInMonth, Math.max(1, Math.floor(monthProgress.daysElapsed)))
  // A payday or semester budget needs its real cycle boundaries before it can be
  // compared honestly with a calendar-month projection.
  if (budget.period && UNSUPPORTED_MONTH_PACE_PERIODS.has(budget.period)) return null
  const budgetAmount = getEffectiveMonthlyEquivalent(budget)
  if (budgetAmount <= 0) return null

  const dailySpend = Array.from({ length: daysElapsed }, () => 0)
  const monthPrefix = `${budget.month}-`

  for (const transaction of transactions) {
    if (
      transaction.type !== 'expense' ||
      transaction.category !== budget.category ||
      !transaction.date.startsWith(monthPrefix)
    ) {
      continue
    }

    const day = Number.parseInt(transaction.date.slice(-2), 10)
    if (Number.isNaN(day) || day < 1 || day > daysElapsed) continue
    dailySpend[day - 1] += Math.abs(transaction.amount)
  }

  const cumulativeSpend: number[] = []
  let spentSoFar = 0
  for (const amount of dailySpend) {
    spentSoFar += amount
    cumulativeSpend.push(roundMoney(spentSoFar))
  }

  const dailyPace = spentSoFar / daysElapsed
  const projectedSpend = dailyPace * daysInMonth
  const projectedRemaining = budgetAmount - projectedSpend
  if (projectedSpend <= budgetAmount) return null

  const amountAbovePlan = projectedSpend - budgetAmount
  const label = getCategoryLabel(budget.category)

  return {
    id: `pace:${budget.category}:${budget.month}`,
    type: 'pace',
    category: budget.category,
    direction: 'up',
    magnitude: roundMoney(amountAbovePlan),
    sentence: `At this pace, ${label} could reach ${formatDollar(projectedSpend)} by month-end — ${formatDollar(amountAbovePlan)} above your plan.`,
    budgetAmount: roundMoney(budgetAmount),
    cumulativeSpend,
    spentSoFar: roundMoney(spentSoFar),
    dailyPace: roundMoney(dailyPace),
    projectedSpend: roundMoney(projectedSpend),
    projectedRemaining: roundMoney(projectedRemaining),
    daysElapsed,
    daysInMonth,
  }
}

/**
 * Finds the strongest category outlier: either one transaction or a whole day
 * whose spend is more than twice the average from the preceding four weeks.
 * Sparse history is deliberately ignored.
 */
export function detectSpike(
  transactions: readonly Transaction[],
  category: TransactionCategory,
): SpikeInsight | null {
  const categoryTransactions = transactions
    .filter((transaction) => transaction.type === 'expense' && transaction.category === category)
    .filter((transaction) => Number.isFinite(transaction.amount) && transaction.amount > 0)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))

  let best: SpikeInsight | null = null

  for (let index = 0; index < categoryTransactions.length; index += 1) {
    const transaction = categoryTransactions[index]
    const baseline = priorTransactionsWithinLookback(categoryTransactions, index, transaction.date)
    if (baseline.length < MIN_SPIKE_BASELINE_TRANSACTIONS) continue

    const typicalAmount = sumAmounts(baseline) / baseline.length
    if (transaction.amount > typicalAmount * SPIKE_MULTIPLIER) {
      best = chooseStrongerSpike(best, makeSpikeInsight({
        category,
        date: transaction.date,
        amount: transaction.amount,
        typicalAmount,
        transactionId: transaction.id,
        source: 'transaction',
      }))
    }
  }

  const dailyTotals = toDailyTotals(categoryTransactions)
  for (let index = 0; index < dailyTotals.length; index += 1) {
    const day = dailyTotals[index]
    const baseline = priorDaysWithinLookback(dailyTotals, index, day.date)
    if (baseline.length < MIN_SPIKE_BASELINE_TRANSACTIONS) continue

    const typicalAmount = baseline.reduce((sum, item) => sum + item.amount, 0) / baseline.length
    if (day.amount > typicalAmount * SPIKE_MULTIPLIER) {
      best = chooseStrongerSpike(best, makeSpikeInsight({
        category,
        date: day.date,
        amount: day.amount,
        typicalAmount,
        source: 'day',
      }))
    }
  }

  return best
}

/**
 * Applies the product priority order and caps the result. Inputs are copied and
 * rounded, so callers can keep their richer calculation objects unchanged.
 */
export function rankInsights(allComputedInsights: readonly Insight[]): Insight[] {
  const uniqueById = new Map<string, Insight>()

  for (const insight of allComputedInsights) {
    if (!Number.isFinite(insight.magnitude) || !insight.sentence.trim()) continue
    const normalized: Insight = {
      id: insight.id,
      type: insight.type,
      category: insight.category,
      direction: insight.direction,
      magnitude: roundMoney(Math.abs(insight.magnitude)),
      sentence: insight.sentence.trim(),
    }
    const existing = uniqueById.get(normalized.id)
    if (!existing || normalized.magnitude > existing.magnitude) uniqueById.set(normalized.id, normalized)
  }

  return [...uniqueById.values()]
    .sort((left, right) => {
      const priorityDifference = insightPriority(left) - insightPriority(right)
      if (priorityDifference !== 0) return priorityDifference
      const magnitudeDifference = right.magnitude - left.magnitude
      if (magnitudeDifference !== 0) return magnitudeDifference
      return left.id.localeCompare(right.id)
    })
    .slice(0, MAX_RANKED_INSIGHTS)
}

/** Builds and ranks the three supported insight candidates for the given data. */
export function getInsights(
  transactions: readonly Transaction[],
  budgets: readonly Budget[],
  options: InsightEngineOptions = {},
): Insight[] {
  const asOf = options.asOf ?? new Date()
  const month = formatDateLocal(asOf).slice(0, 7)
  const monthProgress: MonthProgress = {
    daysElapsed: asOf.getDate(),
    daysInMonth: getDaysInMonthLocal(asOf),
  }
  const categories = new Set<TransactionCategory>([
    ...BUDGET_CATEGORIES.map((item) => item.category),
    ...transactions.filter((transaction) => transaction.type === 'expense').map((transaction) => transaction.category),
  ])
  const candidates: Insight[] = []

  for (const category of categories) {
    const delta = getCategoryDelta(transactions, category, {
      unit: options.deltaPeriod ?? 'week',
      asOf,
    })
    const spike = detectSpike(transactions, category)
    if (delta) candidates.push(delta)
    if (spike) candidates.push(spike)
  }

  for (const budget of budgets) {
    if (budget.month !== month) continue
    const pace = getPaceVsBudget(transactions, budget, monthProgress)
    if (pace) candidates.push(pace)
  }

  return rankInsights(candidates)
}

// ============================================================================
// Internal helpers
// ============================================================================

interface DateRange {
  start: string
  end: string
}

interface DailyTotal {
  date: string
  amount: number
}

function normalizeDeltaPeriod(period: ComparisonPeriodUnit | CategoryDeltaPeriod): Required<CategoryDeltaPeriod> {
  return typeof period === 'string'
    ? { unit: period, asOf: new Date() }
    : { unit: period.unit, asOf: period.asOf ?? new Date() }
}

function getComparisonRange(unit: ComparisonPeriodUnit, asOf: Date): DateRange {
  const end = formatDateLocal(asOf)
  const startDate = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate())

  if (unit === 'week') {
    const day = startDate.getDay()
    startDate.setDate(startDate.getDate() - (day === 0 ? 6 : day - 1))
  } else {
    startDate.setDate(1)
  }

  return { start: formatDateLocal(startDate), end }
}

function getPriorEquivalentRange(currentRange: DateRange, unit: ComparisonPeriodUnit): DateRange {
  const currentStart = parseDateLocal(currentRange.start)
  const currentEnd = parseDateLocal(currentRange.end)
  if (unit === 'week') {
    return {
      start: formatDateLocal(subtractDaysLocal(currentStart, 7)),
      end: formatDateLocal(subtractDaysLocal(currentEnd, 7)),
    }
  }

  const priorMonthStart = new Date(currentStart.getFullYear(), currentStart.getMonth() - 1, 1)
  const priorMonthEnd = new Date(
    priorMonthStart.getFullYear(),
    priorMonthStart.getMonth(),
    Math.min(currentEnd.getDate(), getDaysInMonthLocal(priorMonthStart)),
  )

  return { start: formatDateLocal(priorMonthStart), end: formatDateLocal(priorMonthEnd) }
}

function categoryExpensesInRange(
  transactions: readonly Transaction[],
  category: TransactionCategory,
  range: DateRange,
): Transaction[] {
  return transactions.filter((transaction) => (
    transaction.type === 'expense' &&
    transaction.category === category &&
    transaction.date >= range.start &&
    transaction.date <= range.end
  ))
}

function priorTransactionsWithinLookback(
  transactions: readonly Transaction[],
  index: number,
  date: string,
): Transaction[] {
  const cutoff = formatDateLocal(subtractDaysLocal(parseDateLocal(date), SPIKE_LOOKBACK_DAYS))
  return transactions.slice(0, index).filter((transaction) => transaction.date >= cutoff)
}

function priorDaysWithinLookback(
  days: readonly DailyTotal[],
  index: number,
  date: string,
): DailyTotal[] {
  const cutoff = formatDateLocal(subtractDaysLocal(parseDateLocal(date), SPIKE_LOOKBACK_DAYS))
  return days.slice(0, index).filter((day) => day.date >= cutoff)
}

function toDailyTotals(transactions: readonly Transaction[]): DailyTotal[] {
  const totals = new Map<string, number>()
  for (const transaction of transactions) {
    totals.set(transaction.date, (totals.get(transaction.date) ?? 0) + transaction.amount)
  }
  return [...totals.entries()]
    .map(([date, amount]) => ({ date, amount }))
    .sort((left, right) => left.date.localeCompare(right.date))
}

function makeSpikeInsight(input: {
  category: TransactionCategory
  date: string
  amount: number
  typicalAmount: number
  transactionId?: string
  source: SpikeInsight['source']
}): SpikeInsight {
  const label = getCategoryLabel(input.category)
  const typical = roundMoney(input.typicalAmount)
  const amount = roundMoney(input.amount)
  const multiple = Math.max(SPIKE_MULTIPLIER, Math.round((input.amount / input.typicalAmount) * 10) / 10)

  return {
    id: `spike:${input.source}:${input.category}:${input.date}${input.transactionId ? `:${input.transactionId}` : ''}`,
    type: 'spike',
    category: input.category,
    direction: 'up',
    magnitude: amount,
    sentence: `Your ${label} spending hit ${formatDollar(amount)} on ${formatShortDate(input.date)} — about ${multiple}× your usual ${formatDollar(typical)}.`,
    date: input.date,
    transactionId: input.transactionId,
    typicalAmount: typical,
    source: input.source,
  }
}

function chooseStrongerSpike(current: SpikeInsight | null, candidate: SpikeInsight): SpikeInsight {
  if (!current) return candidate
  const currentExcess = current.magnitude - current.typicalAmount
  const candidateExcess = candidate.magnitude - candidate.typicalAmount
  return candidateExcess > currentExcess ? candidate : current
}

function getCategoryLabel(category: TransactionCategory): string {
  return BUDGET_CATEGORIES.find((item) => item.category === category)?.label ?? category
}

function sumAmounts(transactions: readonly Pick<Transaction, 'amount'>[]): number {
  return transactions.reduce((total, transaction) => total + Math.abs(transaction.amount), 0)
}

function insightPriority(insight: Insight): number {
  if (insight.type === 'pace' && insight.direction === 'up') return 0
  if (insight.type === 'category_delta') return 1
  if (insight.type === 'spike') return 2
  return 3
}

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100
}

function formatDollar(amount: number): string {
  return formatCurrency(Math.round(Math.abs(amount)), 'USD', { fractionDigits: 0 })
}

function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(parseDateLocal(date))
}
