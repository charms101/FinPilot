import { discretionaryIncome } from './calculations'
import type { Profile } from './profile'

export interface PlaybookRule {
  condition: (profile: Profile) => boolean
  book: string
  author: string
  principle: string
  tip: string
}

export type PlaybookCard = Omit<PlaybookRule, 'condition'>

export const playbookRules: PlaybookRule[] = [
  {
    condition: (profile) => profile.hasDebt && profile.debtType !== 'none',
    book: 'The Total Money Makeover',
    author: 'Dave Ramsey',
    principle: 'Debt snowball',
    tip: 'List debts smallest to largest and throw every spare dollar at the smallest one first. Momentum matters more than interest rate here.',
  },
  {
    condition: (profile) => discretionaryIncome(profile) < 0,
    book: 'All Your Worth',
    author: 'Elizabeth Warren & Amelia Warren Tyagi',
    principle: '50/30/20 rule',
    tip: 'Aim to keep needs at 50% of income, wants at 30%, and savings at 20%. Right now needs are eating into that split.',
  },
  {
    condition: (profile) => profile.currentSavingsHabit === 'none' && profile.primaryGoal !== 'pay_off_debt',
    book: 'The Simple Path to Wealth',
    author: 'JL Collins',
    principle: 'Automate before you spend',
    tip: "Set up an automatic transfer the day you get paid, even a small one. You adjust to what's left, not the other way around.",
  },
  {
    condition: (profile) =>
      profile.topSpendingCategories.includes('shopping') || profile.topSpendingCategories.includes('dining'),
    book: 'The Psychology of Money',
    author: 'Morgan Housel',
    principle: 'Save regardless of income',
    tip: 'Savings rate matters more than income level. Small, consistent cuts to discretionary spending compound the same way investing gains do.',
  },
  {
    condition: (profile) => profile.primaryGoal === 'invest' || profile.riskTolerance === 'high',
    book: 'Rich Dad Poor Dad',
    author: 'Robert Kiyosaki',
    principle: 'Assets vs liabilities',
    tip: 'Before adding a new expense, ask whether it puts money in your pocket over time or takes it out.',
  },
  {
    condition: (profile) => profile.currentSavingsHabit !== 'none',
    book: 'I Will Teach You to Be Rich',
    author: 'Ramit Sethi',
    principle: 'Conscious spending plan',
    tip: "You're already saving. The next lever is spending extravagantly on what you love and cutting ruthlessly on what you don't.",
  },
]

export function matchingPlaybookRules(profile: Profile): PlaybookCard[] {
  const matches = playbookRules.filter((rule) => rule.condition(profile))

  if (matches.length > 0) {
    return matches
  }

  return [
    {
      book: 'The Psychology of Money',
      author: 'Morgan Housel',
      principle: 'Room for error',
      tip: 'Keep a little margin in your monthly plan so normal surprises do not throw the whole month off course.',
    },
  ] satisfies PlaybookCard[]
}
