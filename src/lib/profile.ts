export type IncomeType = 'salaried' | 'freelance' | 'mixed'
export type DebtType = 'credit_card' | 'student_loan' | 'auto' | 'other' | 'none'
export type SavingsHabit = 'none' | 'occasional' | 'automatic'
export type SpendingCategory = 'dining' | 'shopping' | 'subscriptions' | 'travel' | 'hobbies' | 'other'
export type PrimaryGoal = 'pay_off_debt' | 'emergency_fund' | 'buy_home' | 'invest' | 'just_curious'
export type RiskTolerance = 'low' | 'medium' | 'high'

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
  household: 'just_me' | 'partner' | 'kids' | 'partner_kids'
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
