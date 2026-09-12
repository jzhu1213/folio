"use client"

import { useEffect, useMemo, useState } from "react"
import { animate, motion, useMotionValue } from "motion/react"
import type { ConfidenceBand, HeroDisplay, HeroMeaning, Transaction } from "@/types"
import type { SpendingMode } from "@/lib/spendingModes"
import { GlassCard } from "@/components/ui"
import { useReducedMotion } from "@/lib/animations"
import { motionDurations, monthlyRunwayTransition, reducedFade } from "@/lib/motionPresets"
import { typographyRoles } from "@/styles/typography"
import { formatCurrency as formatCurrencyUtil } from "@/lib/currencyUtils"

interface DailyAllowanceHeroProps {
  allowanceLeft: number
  dailyBudget: number
  spentToday: number
  rollover: number
  isOverBudget: boolean
  isLoading: boolean
  /** Transactions are supplied by the existing home-screen data flow. */
  transactions?: readonly Transaction[]
  deferredSpending?: number
  reservedForBills?: number
  upcomingBillCount?: number
  reservedForScheduled?: number
  scheduledCount?: number
  confidenceBand?: ConfidenceBand
  onTapForDetails: () => void
  spendingMode?: SpendingMode
  heroMeaning?: HeroMeaning
  heroDisplay?: HeroDisplay
  isNewDay?: boolean
  periodTransitionText?: string
  onDismissPeriodTransition?: () => void
  isEstimated?: boolean
  onLogIncome?: () => void
  onLongPress?: () => void
}

interface MonthlyRunwayData {
  cumulativeSpend: number[]
  spentThisMonth: number
  projectedRemaining: number
  monthEndLabel: string
  daysElapsed: number
}

function formatCurrency(amount: number): string {
  return formatCurrencyUtil(Math.round(Math.abs(amount)), "USD", { fractionDigits: 0 })
}

function formatDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Builds the month-to-date spending series from transaction effective dates.
 * Income and future-dated expenses do not contribute to the runway pace.
 */
function buildMonthlyRunway(
  transactions: readonly Transaction[],
  dailyBudget: number,
  now: Date,
): MonthlyRunwayData {
  const year = now.getFullYear()
  const month = now.getMonth()
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)
  const daysInMonth = monthEnd.getDate()
  const daysElapsed = Math.max(1, now.getDate())
  const monthStartKey = formatDateLocal(monthStart)
  const todayKey = formatDateLocal(now)
  const dailySpend = Array.from({ length: daysElapsed }, () => 0)

  for (const transaction of transactions) {
    const date = transaction.date.slice(0, 10)
    if (transaction.type !== "expense" || date < monthStartKey || date > todayKey) {
      continue
    }

    const day = Number.parseInt(date.slice(-2), 10)
    if (Number.isNaN(day) || day < 1 || day > daysElapsed) continue
    dailySpend[day - 1] += Math.abs(transaction.amount)
  }

  const cumulativeSpend: number[] = []
  let runningTotal = 0
  for (const amount of dailySpend) {
    runningTotal += amount
    cumulativeSpend.push(runningTotal)
  }

  const spentThisMonth = runningTotal
  const projectedSpend = (spentThisMonth / daysElapsed) * daysInMonth
  // The daily allowance is the established home-screen plan. Scaling it to
  // this calendar month gives this hero a plan baseline without another fetch.
  const plannedMonthAmount = Math.max(0, dailyBudget) * daysInMonth

  return {
    cumulativeSpend,
    spentThisMonth,
    projectedRemaining: plannedMonthAmount - projectedSpend,
    monthEndLabel: new Intl.DateTimeFormat(undefined, {
      month: "long",
      day: "numeric",
    }).format(monthEnd),
    daysElapsed,
  }
}

function AnimatedRunwayAmount({
  amount,
  prefersReducedMotion,
}: {
  amount: number
  prefersReducedMotion: boolean
}) {
  const amountValue = useMotionValue(prefersReducedMotion ? amount : 0)
  const [displayAmount, setDisplayAmount] = useState(prefersReducedMotion ? amount : 0)

  useEffect(() => {
    if (prefersReducedMotion) {
      amountValue.set(amount)
      setDisplayAmount(amount)
      return
    }

    const controls = animate(amountValue, amount, monthlyRunwayTransition)
    return () => controls.stop()
  }, [amount, amountValue, prefersReducedMotion])

  useEffect(() => amountValue.on("change", setDisplayAmount), [amountValue])

  return (
    <span
      aria-hidden="true"
      style={{
        ...typographyRoles.monthlyRunwayNumber,
        color: "var(--text-primary)",
        display: "block",
      }}
    >
      {formatCurrency(displayAmount)}
    </span>
  )
}

function SpendingSparkline({
  values,
  prefersReducedMotion,
}: {
  values: readonly number[]
  prefersReducedMotion: boolean
}) {
  const width = 320
  const height = 64
  const inset = 4
  const maximum = Math.max(...values, 1)
  const pointY = (value: number) => height - inset - (value / maximum) * (height - inset * 2)
  const points = values.map((value, index) => {
    const x = values.length === 1
      ? inset
      : inset + (index / (values.length - 1)) * (width - inset * 2)
    return `${x} ${pointY(value)}`
  })
  const path = values.length <= 1
    ? `M ${inset} ${pointY(values[0] ?? 0)} L ${width - inset} ${pointY(values[0] ?? 0)}`
    : `M ${points.join(" L ")}`

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height: 64 }}
    >
      <path
        d={`M ${inset} ${height - inset} H ${width - inset}`}
        fill="none"
        stroke="var(--border-default-color)"
        strokeWidth="1"
      />
      <motion.path
        d={path}
        fill="none"
        stroke="var(--accent)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        initial={prefersReducedMotion ? { opacity: 0 } : { pathLength: 0, opacity: 1 }}
        animate={prefersReducedMotion ? { opacity: 1 } : { pathLength: 1, opacity: 1 }}
        transition={prefersReducedMotion
          ? { duration: motionDurations.fast }
          : monthlyRunwayTransition}
      />
    </svg>
  )
}

function HeroSkeleton() {
  return (
    <GlassCard elevation="high" className="monthly-runway-hero w-full" style={{ padding: "28px 20px" }}>
      <div aria-label="Loading monthly runway" role="status" className="flex flex-col gap-3">
        <div className="animate-pulse rounded-md" style={{ width: 130, height: 18, background: "var(--surface-recessed)" }} />
        <div className="animate-pulse rounded-md" style={{ width: 210, height: 50, background: "var(--surface-recessed)" }} />
        <div className="animate-pulse rounded-md" style={{ width: "100%", height: 64, background: "var(--surface-recessed)" }} />
      </div>
    </GlassCard>
  )
}

/**
 * The home screen's Monthly Runway. The file name remains a compatibility
 * boundary for the existing dashboard import; RateDisplay is a separate
 * exchange-rate control and is not the home hero.
 */
export function DailyAllowanceHero({
  dailyBudget,
  isLoading,
  onTapForDetails,
  transactions = [],
}: DailyAllowanceHeroProps) {
  const { prefersReducedMotion } = useReducedMotion()
  const runway = useMemo(
    () => buildMonthlyRunway(transactions, dailyBudget, new Date()),
    [dailyBudget, transactions],
  )

  if (isLoading) return <HeroSkeleton />

  const projection = runway.projectedRemaining >= 0
    ? `At this pace, you’ll have about ${formatCurrency(runway.projectedRemaining)} left by ${runway.monthEndLabel}.`
    : `At this pace, you may be about ${formatCurrency(runway.projectedRemaining)} short by ${runway.monthEndLabel}.`

  return (
    <GlassCard
      elevation="high"
      className="monthly-runway-hero w-full"
      style={{ padding: "28px 20px" }}
    >
      <motion.button
        type="button"
        className="focus-ring interactive-control flex w-full flex-col items-start gap-3 rounded-lg text-left"
        style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
        onClick={onTapForDetails}
        aria-label={`Monthly Runway. Spent this month: ${formatCurrency(runway.spentThisMonth)}. ${projection} Tap for details.`}
        aria-live="polite"
        aria-atomic="true"
        initial={prefersReducedMotion ? "initial" : { opacity: 0, y: 8 }}
        animate={prefersReducedMotion ? "enter" : { opacity: 1, y: 0 }}
        variants={prefersReducedMotion ? reducedFade : undefined}
        transition={prefersReducedMotion ? undefined : monthlyRunwayTransition}
      >
        <span style={{ ...typographyRoles.labelButton, color: "var(--text-secondary)" }}>
          Monthly Runway
        </span>
        <div>
          <span style={{ ...typographyRoles.caption, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
            Spent this month
          </span>
          <AnimatedRunwayAmount amount={runway.spentThisMonth} prefersReducedMotion={prefersReducedMotion} />
        </div>
        <div className="w-full">
          <span style={{ ...typographyRoles.caption, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
            Daily pace · {runway.daysElapsed} {runway.daysElapsed === 1 ? "day" : "days"} so far
          </span>
          <SpendingSparkline values={runway.cumulativeSpend} prefersReducedMotion={prefersReducedMotion} />
        </div>
        <p style={{ ...typographyRoles.body, color: "var(--text-primary)", margin: 0, maxWidth: 360 }}>
          {projection}
        </p>
      </motion.button>
    </GlassCard>
  )
}
