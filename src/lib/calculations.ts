import type { Profile, SpendingCategory } from './profile'

export interface SimulatedTransaction {
  id: string
  label: string
  category: SpendingCategory
  amount: number
}

const categoryLabels: Record<SpendingCategory, string> = {
  dining: 'Dining out',
  shopping: 'Shopping',
  subscriptions: 'Streaming subscriptions',
  travel: 'Travel fund',
  hobbies: 'Hobbies',
  other: 'Other spending',
}

function cleanAmount(value: number) {
  return Number.isFinite(value) ? Math.max(value, 0) : 0
}

export function discretionaryIncome(profile: Profile) {
  return (
    cleanAmount(profile.monthlyIncome) -
    cleanAmount(profile.housingCost) -
    cleanAmount(profile.otherFixedBills) -
    cleanAmount(profile.debtMinPayment)
  )
}

export function currentSavingsRate(profile: Profile) {
  const discretionary = Math.max(discretionaryIncome(profile), 0)

  if (profile.currentSavingsHabit === 'automatic') {
    return discretionary * 0.15
  }

  if (profile.currentSavingsHabit === 'occasional') {
    return discretionary * 0.05
  }

  return 0
}

export function healthScore(profile: Profile) {
  const income = cleanAmount(profile.monthlyIncome)
  const annualIncome = income * 12
  const savings = currentSavingsRate(profile)
  const savingsRate = income > 0 ? savings / income : 0
  const savingsPoints = Math.min(Math.max(savingsRate / 0.2, 0), 1) * 40
  const debtToIncome = annualIncome > 0 ? cleanAmount(profile.debtBalance) / annualIncome : profile.debtBalance > 0 ? 1 : 0
  const debtPoints = Math.max(0, 1 - Math.min(debtToIncome, 1)) * 30
  const habitPoints =
    profile.currentSavingsHabit === 'automatic' ? 30 : profile.currentSavingsHabit === 'occasional' ? 15 : 0

  return Math.round(Math.min(Math.max(savingsPoints + debtPoints + habitPoints, 0), 100))
}

export function healthLabel(score: number) {
  if (score >= 80) return 'Strong rhythm'
  if (score >= 60) return 'Steady progress'
  if (score >= 35) return 'Building momentum'
  return 'Getting oriented'
}

export function simulatedTransactions(profile: Profile): SimulatedTransaction[] {
  const discretionary = Math.max(discretionaryIncome(profile), 0)
  const targetSpend = discretionary * 0.6
  const categories =
    profile.topSpendingCategories.length > 0
      ? profile.topSpendingCategories
      : (['dining', 'shopping', 'subscriptions'] satisfies SpendingCategory[])
  const weights = [0.34, 0.24, 0.18, 0.12, 0.08, 0.04]
  const repeatedCategories = Array.from({ length: Math.min(Math.max(categories.length + 2, 4), 6) }, (_, index) => {
    return categories[index % categories.length]
  })

  return repeatedCategories.map((category, index) => ({
    id: `${category}-${index}`,
    label: categoryLabels[category],
    category,
    amount: Math.round(targetSpend * weights[index]),
  }))
}

export function spendingByCategory(profile: Profile) {
  const totals = simulatedTransactions(profile).reduce<Record<string, number>>((acc, transaction) => {
    acc[transaction.category] = (acc[transaction.category] ?? 0) + transaction.amount
    return acc
  }, {})

  return Object.entries(totals).map(([category, amount]) => ({
    category: categoryLabels[category as SpendingCategory],
    amount,
  }))
}

export function futureValue(monthlyContribution: number, annualRatePct: number, years: number) {
  const contribution = cleanAmount(monthlyContribution)
  const r = annualRatePct / 100 / 12
  const n = years * 12

  if (r === 0) {
    return contribution * n
  }

  return contribution * ((Math.pow(1 + r, n) - 1) / r)
}

export function estimatedPlaybookLift(profile: Profile) {
  const discretionary = Math.max(discretionaryIncome(profile), 0)
  let lift = 0

  if (profile.hasDebt && profile.debtType !== 'none') {
    lift += discretionary * 0.1
  }

  if (profile.currentSavingsHabit === 'none' && profile.primaryGoal !== 'pay_off_debt') {
    lift += discretionary * 0.05
  }

  if (profile.topSpendingCategories.includes('shopping') || profile.topSpendingCategories.includes('dining')) {
    lift += discretionary * 0.05
  }

  return Math.min(lift, discretionary * 0.5)
}

export function projectionData(profile: Profile, years: number) {
  const savings = currentSavingsRate(profile)
  const optimizedSavings = savings + estimatedPlaybookLift(profile)

  return Array.from({ length: years + 1 }, (_, index) => ({
    year: index,
    label: index === 0 ? 'Today' : `Year ${index}`,
    currentPath: Math.round(futureValue(savings, 5, index)),
    optimizedPath: Math.round(futureValue(optimizedSavings, 7, index)),
  }))
}
