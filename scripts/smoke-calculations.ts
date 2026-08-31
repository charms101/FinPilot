import assert from 'node:assert/strict'
import {
  currentSavingsRate,
  discretionaryIncome,
  estimatedPlaybookLift,
  healthScore,
  projectionData,
  simulatedTransactions,
  spendingByCategory,
} from '../src/lib/calculations'
import { matchingPlaybookRules } from '../src/lib/playbook'
import { defaultProfile, normalizeProfile, type Profile } from '../src/lib/profile'

const profiles: Profile[] = [
  normalizeProfile({
    ...defaultProfile,
    monthlyIncome: 0,
    hasDebt: true,
    debtType: 'credit_card',
    debtBalance: 1200,
    currentSavingsHabit: 'none',
    primaryGoal: 'emergency_fund',
    topSpendingCategories: ['dining', 'shopping'],
  }),
  normalizeProfile({
    ...defaultProfile,
    monthlyIncome: 2800,
    housingCost: 2200,
    otherFixedBills: 900,
    debtMinPayment: 250,
    hasDebt: true,
    debtType: 'student_loan',
    debtBalance: 18000,
    currentSavingsHabit: 'occasional',
    primaryGoal: 'pay_off_debt',
    topSpendingCategories: ['subscriptions', 'dining'],
  }),
  normalizeProfile({
    ...defaultProfile,
    monthlyIncome: 6200,
    housingCost: 1800,
    otherFixedBills: 900,
    hasDebt: false,
    currentSavingsHabit: 'automatic',
    primaryGoal: 'invest',
    riskTolerance: 'high',
    topSpendingCategories: ['shopping', 'travel'],
  }),
  normalizeProfile({
    ...defaultProfile,
    monthlyIncome: 4600,
    incomeType: 'freelance',
    housingCost: 1500,
    otherFixedBills: 700,
    hasDebt: true,
    debtType: 'auto',
    debtBalance: 9000,
    debtMinPayment: 325,
    currentSavingsHabit: 'automatic',
    primaryGoal: 'buy_home',
    topSpendingCategories: ['hobbies', 'shopping'],
  }),
  normalizeProfile({
    ...defaultProfile,
    monthlyIncome: 999999,
    housingCost: 250000,
    otherFixedBills: 125000,
    hasDebt: true,
    debtType: 'other',
    debtBalance: 500000,
    debtMinPayment: 10000,
    currentSavingsHabit: 'occasional',
    primaryGoal: 'invest',
    riskTolerance: 'high',
    topSpendingCategories: ['dining', 'travel', 'subscriptions'],
  }),
]

for (const [index, profile] of profiles.entries()) {
  const values = [
    discretionaryIncome(profile),
    currentSavingsRate(profile),
    healthScore(profile),
    estimatedPlaybookLift(profile),
    ...simulatedTransactions(profile).map((transaction) => transaction.amount),
    ...spendingByCategory(profile).map((category) => category.amount),
    ...projectionData(profile, 20).flatMap((point) => [point.currentPath, point.optimizedPath]),
  ]

  assert.equal(values.every(Number.isFinite), true, `Profile ${index + 1} produced a non-finite value`)
  assert.equal(healthScore(profile) >= 0 && healthScore(profile) <= 100, true, `Profile ${index + 1} score is out of range`)
  assert.equal(matchingPlaybookRules(profile).length >= 2, true, `Profile ${index + 1} should match at least two playbook rules`)
}

const normalized = normalizeProfile({
  monthlyIncome: 'not a number',
  debtType: 'banana',
  topSpendingCategories: ['dining', 'shopping', 'shopping', 'bad', 'travel'],
})

assert.equal(normalized.monthlyIncome, 0)
assert.equal(normalized.debtType, 'none')
assert.deepEqual(normalized.topSpendingCategories, ['dining', 'shopping', 'travel'])

console.log('Smoke calculations passed for 5 profiles and malformed import data.')
