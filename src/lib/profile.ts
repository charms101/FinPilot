export type IncomeType = 'salaried' | 'freelance' | 'mixed'
export type DebtType = 'credit_card' | 'student_loan' | 'auto' | 'other' | 'none'
export type SavingsHabit = 'none' | 'occasional' | 'automatic'
export type SpendingCategory = 'dining' | 'shopping' | 'subscriptions' | 'travel' | 'hobbies' | 'other'
export type PrimaryGoal = 'pay_off_debt' | 'emergency_fund' | 'buy_home' | 'invest' | 'just_curious'
export type RiskTolerance = 'low' | 'medium' | 'high'
export type Household = 'just_me' | 'partner' | 'kids' | 'partner_kids'

export interface Profile {
  monthlyIncome: number
  incomeType: IncomeType
  housingCost: number
  otherFixedBills: number
  hasDebt: boolean
  debtType: DebtType
  debtBalance: number
  debtMinPayment: number
  currentSavingsHabit: SavingsHabit
  topSpendingCategories: SpendingCategory[]
  primaryGoal: PrimaryGoal
  riskTolerance: RiskTolerance
  household: Household
}

export const defaultProfile: Profile = {
  monthlyIncome: 0,
  incomeType: 'salaried',
  housingCost: 0,
  otherFixedBills: 0,
  hasDebt: false,
  debtType: 'none',
  debtBalance: 0,
  debtMinPayment: 0,
  currentSavingsHabit: 'none',
  topSpendingCategories: [],
  primaryGoal: 'just_curious',
  riskTolerance: 'medium',
  household: 'just_me',
}

const incomeTypes = ['salaried', 'freelance', 'mixed'] satisfies IncomeType[]
const debtTypes = ['credit_card', 'student_loan', 'auto', 'other', 'none'] satisfies DebtType[]
const savingsHabits = ['none', 'occasional', 'automatic'] satisfies SavingsHabit[]
const spendingCategories = ['dining', 'shopping', 'subscriptions', 'travel', 'hobbies', 'other'] satisfies SpendingCategory[]
const primaryGoals = ['pay_off_debt', 'emergency_fund', 'buy_home', 'invest', 'just_curious'] satisfies PrimaryGoal[]
const riskTolerances = ['low', 'medium', 'high'] satisfies RiskTolerance[]
const households = ['just_me', 'partner', 'kids', 'partner_kids'] satisfies Household[]

function isOneOf<TValue extends string>(value: unknown, options: readonly TValue[]): value is TValue {
  return typeof value === 'string' && options.includes(value as TValue)
}

function cleanNumber(value: unknown) {
  const numberValue = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(numberValue)) {
    return 0
  }

  return Math.max(numberValue, 0)
}

export function normalizeProfile(value: unknown): Profile {
  const profile = typeof value === 'object' && value !== null ? (value as Partial<Profile>) : {}
  const hasDebt = Boolean(profile.hasDebt)
  const debtType = hasDebt && isOneOf(profile.debtType, debtTypes) && profile.debtType !== 'none'
    ? profile.debtType
    : 'none'
  const selectedCategories = Array.isArray(profile.topSpendingCategories)
    ? profile.topSpendingCategories.filter((category): category is SpendingCategory =>
        isOneOf(category, spendingCategories),
      )
    : []

  return {
    monthlyIncome: cleanNumber(profile.monthlyIncome),
    incomeType: isOneOf(profile.incomeType, incomeTypes) ? profile.incomeType : defaultProfile.incomeType,
    housingCost: cleanNumber(profile.housingCost),
    otherFixedBills: cleanNumber(profile.otherFixedBills),
    hasDebt,
    debtType,
    debtBalance: hasDebt ? cleanNumber(profile.debtBalance) : 0,
    debtMinPayment: hasDebt ? cleanNumber(profile.debtMinPayment) : 0,
    currentSavingsHabit: isOneOf(profile.currentSavingsHabit, savingsHabits)
      ? profile.currentSavingsHabit
      : defaultProfile.currentSavingsHabit,
    topSpendingCategories: Array.from(new Set(selectedCategories)).slice(0, 3),
    primaryGoal: isOneOf(profile.primaryGoal, primaryGoals) ? profile.primaryGoal : defaultProfile.primaryGoal,
    riskTolerance: isOneOf(profile.riskTolerance, riskTolerances) ? profile.riskTolerance : defaultProfile.riskTolerance,
    household: isOneOf(profile.household, households) ? profile.household : defaultProfile.household,
  }
}
