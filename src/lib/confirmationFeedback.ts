import type { Budget, Transaction, TransactionCategory } from '@/types'
import { formatMoney } from '@/lib/localeFormat'

export interface ExpenseConfirmationInput {
  amount: number
  category: TransactionCategory
  categoryLabel: string
  date: string
  transactions: readonly Transaction[]
  budgets: readonly Budget[]
  dailyBudget: number
  now?: Date
}

export interface TransactionChangeConfirmationInput {
  action: 'updated' | 'deleted'
  transaction: Transaction
  categoryLabel: string
  /** The already-updated transaction collection. */
  transactions: readonly Transaction[]
  budgets: readonly Budget[]
  dailyBudget: number
  now?: Date
}

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Creates the copy for a saved quick-add expense from the post-save state.
 * Category budgets take priority; the Monthly Runway pace is the fallback for
 * categories that do not have a limit yet.
 */
export function buildExpenseConfirmation({
  amount,
  category,
  categoryLabel,
  date,
  transactions,
  budgets,
  dailyBudget,
  now = new Date(),
}: ExpenseConfirmationInput): string {
  const submittedAmount = Math.abs(amount)
  const monthKey = date.slice(0, 7)
  const budget = budgets.find((item) => item.category === category && item.month === monthKey)

  if (budget) {
    // `spent` is the persisted month-to-date value. Calculating from loaded
    // transactions as well keeps the message sound when an optimistic save is
    // already present in memory.
    const transactionSpend = transactions.reduce((total, transaction) => (
      transaction.type === 'expense'
        && transaction.category === category
        && transaction.date.slice(0, 7) === monthKey
        ? total + Math.abs(transaction.amount)
        : total
    ), 0)
    const remaining = budget.monthlyLimit - Math.max(budget.spent, transactionSpend) - submittedAmount

    if (remaining >= 0) {
      return `Logged ${formatMoney(submittedAmount)} to ${categoryLabel}. ${formatMoney(remaining)} left in ${categoryLabel} this month.`
    }

    return `Logged ${formatMoney(submittedAmount)} to ${categoryLabel}. You may be about ${formatMoney(Math.abs(remaining))} short in ${categoryLabel} this month.`
  }

  const currentMonthKey = toDateKey(now).slice(0, 7)
  const todayKey = toDateKey(now)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const daysInMonth = monthEnd.getDate()
  const daysElapsed = Math.max(1, now.getDate())
  const spentToDate = transactions.reduce((total, transaction) => {
    const transactionDate = transaction.date.slice(0, 10)
    return transaction.type === 'expense'
      && transactionDate.slice(0, 7) === currentMonthKey
      && transactionDate <= todayKey
      ? total + Math.abs(transaction.amount)
      : total
  }, 0)
  const submittedInCurrentRunway = monthKey === currentMonthKey && date <= todayKey ? submittedAmount : 0
  const projectedRemaining = Math.max(0, dailyBudget) * daysInMonth
    - ((spentToDate + submittedInCurrentRunway) / daysElapsed) * daysInMonth

  if (projectedRemaining >= 0) {
    return `Logged ${formatMoney(submittedAmount)} to ${categoryLabel}. ${formatMoney(projectedRemaining)} left this month.`
  }

  const monthEndLabel = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    day: 'numeric',
  }).format(monthEnd)
  return `Logged ${formatMoney(submittedAmount)} to ${categoryLabel}. You may be about ${formatMoney(Math.abs(projectedRemaining))} short by ${monthEndLabel}.`
}

/**
 * Creates edit/delete feedback from the post-mutation collection. This keeps
 * the detail sheet on the same budget/runway confirmation path as quick-add
 * without adding the edited amount a second time.
 */
export function buildTransactionChangeConfirmation({
  action,
  transaction,
  categoryLabel,
  transactions,
  budgets,
  dailyBudget,
  now = new Date(),
}: TransactionChangeConfirmationInput): string {
  const verb = action === 'updated' ? 'Updated' : 'Deleted'
  const amount = formatMoney(Math.abs(transaction.amount))
  const monthKey = transaction.date.slice(0, 7)
  const budget = budgets.find((item) => item.category === transaction.category && item.month === monthKey)

  if (budget && transaction.type === 'expense') {
    const transactionSpend = transactions.reduce((total, candidate) => (
      candidate.type === 'expense'
        && candidate.category === transaction.category
        && candidate.date.slice(0, 7) === monthKey
        ? total + Math.abs(candidate.amount)
        : total
    ), 0)
    const remaining = budget.monthlyLimit - Math.max(budget.spent, transactionSpend)
    const detail = remaining >= 0
      ? `${formatMoney(remaining)} left in ${categoryLabel} this month.`
      : `You may be about ${formatMoney(Math.abs(remaining))} short in ${categoryLabel} this month.`
    return `${verb} ${amount} in ${categoryLabel}. ${detail}`
  }

  const currentMonthKey = toDateKey(now).slice(0, 7)
  const todayKey = toDateKey(now)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const daysElapsed = Math.max(1, now.getDate())
  const spentToDate = transactions.reduce((total, candidate) => {
    const candidateDate = candidate.date.slice(0, 10)
    return candidate.type === 'expense'
      && candidateDate.slice(0, 7) === currentMonthKey
      && candidateDate <= todayKey
      ? total + Math.abs(candidate.amount)
      : total
  }, 0)
  const projectedRemaining = Math.max(0, dailyBudget) * monthEnd.getDate()
    - (spentToDate / daysElapsed) * monthEnd.getDate()

  if (projectedRemaining >= 0) {
    return `${verb} ${amount} in ${categoryLabel}. ${formatMoney(projectedRemaining)} left this month.`
  }

  const monthEndLabel = new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric' }).format(monthEnd)
  return `${verb} ${amount} in ${categoryLabel}. You may be about ${formatMoney(Math.abs(projectedRemaining))} short by ${monthEndLabel}.`
}
