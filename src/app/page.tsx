'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Download,
  Info,
  LineChart,
  LockKeyhole,
  Moon,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Sun,
  Upload,
  WalletCards,
  X,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTheme } from '@/components/ThemeProvider'
import {
  currentSavingsRate,
  discretionaryIncome,
  estimatedPlaybookLift,
  futureValue,
  healthLabel,
  healthScore,
  projectionData,
  simulatedTransactions,
  spendingByCategory,
} from '@/lib/calculations'
import {
  defaultProfile,
  normalizeProfile,
  type DebtType,
  type IncomeType,
  type PrimaryGoal,
  type Profile,
  type RiskTolerance,
  type SavingsHabit,
  type SpendingCategory,
} from '@/lib/profile'
import { matchingPlaybookRules } from '@/lib/playbook'
import { formatCurrency } from '@/lib/utils'

type Screen = 'landing' | 'questions' | 'dashboard' | 'playbook' | 'future'

const screens: Array<{ id: Screen; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'landing', label: 'Landing', icon: Sparkles },
  { id: 'questions', label: 'Questions', icon: WalletCards },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'playbook', label: 'Playbook', icon: BookOpen },
  { id: 'future', label: 'Future you', icon: LineChart },
]

const disclaimer =
  'This is an educational simulation, not a real bank, not FDIC-insured, and not personalized financial advice.'

const storageKey = 'finpilot-profile'

const incomeTypeOptions: Array<{ value: IncomeType; label: string }> = [
  { value: 'salaried', label: 'Salaried' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'mixed', label: 'A mix' },
]

const debtTypeOptions: Array<{ value: DebtType; label: string }> = [
  { value: 'credit_card', label: 'Credit card' },
  { value: 'student_loan', label: 'Student loan' },
  { value: 'auto', label: 'Auto' },
  { value: 'other', label: 'Other' },
]

const savingsHabitOptions: Array<{ value: SavingsHabit; label: string }> = [
  { value: 'none', label: 'Never' },
  { value: 'occasional', label: 'Occasionally' },
  { value: 'automatic', label: 'Automatically every month' },
]

const spendingCategoryOptions: Array<{ value: SpendingCategory; label: string }> = [
  { value: 'dining', label: 'Dining out' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'travel', label: 'Travel' },
  { value: 'hobbies', label: 'Hobbies' },
  { value: 'other', label: 'Other' },
]

const goalOptions: Array<{ value: PrimaryGoal; label: string }> = [
  { value: 'pay_off_debt', label: 'Pay off debt' },
  { value: 'emergency_fund', label: 'Build an emergency fund' },
  { value: 'buy_home', label: 'Buy a home' },
  { value: 'invest', label: 'Start investing' },
  { value: 'just_curious', label: 'Just curious' },
]

const riskOptions: Array<{ value: RiskTolerance; label: string }> = [
  { value: 'low', label: 'Sell' },
  { value: 'medium', label: 'Hold' },
  { value: 'high', label: 'Buy more' },
]

const householdOptions: Array<{ value: Profile['household']; label: string }> = [
  { value: 'just_me', label: 'Just me' },
  { value: 'partner', label: 'Partner' },
  { value: 'kids', label: 'Kids' },
  { value: 'partner_kids', label: 'Partner + kids' },
]

function loadStoredProfile() {
  if (typeof window === 'undefined') {
    return defaultProfile
  }

  try {
    const savedProfile = window.localStorage.getItem(storageKey)

    if (!savedProfile) {
      return defaultProfile
    }

    return normalizeProfile(JSON.parse(savedProfile))
  } catch {
    return defaultProfile
  }
}

function moneyValue(value: number) {
  return Number.isFinite(value) ? value : 0
}

export default function FinPilotSimulation() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing')
  const [profile, setProfile] = useState<Profile>(loadStoredProfile)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const currentIndex = useMemo(
    () => screens.findIndex((screen) => screen.id === currentScreen),
    [currentScreen],
  )

  const goNext = () => setCurrentScreen(screens[Math.min(currentIndex + 1, screens.length - 1)].id)
  const goBack = () => setCurrentScreen(screens[Math.max(currentIndex - 1, 0)].id)

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(profile))
  }, [profile])

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <button
            type="button"
            onClick={() => setCurrentScreen('landing')}
            className="flex items-center gap-2 text-left"
            aria-label="Go to landing"
          >
            <span className="grid size-9 place-items-center rounded-lg bg-emerald-600 text-white">
              <WalletCards className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-none">FinPilot</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">Financial mirror</span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 md:flex" aria-label="App screens">
            {screens.map((screen) => {
              const Icon = screen.icon
              const isActive = currentScreen === screen.id

              return (
                <button
                  key={screen.id}
                  type="button"
                  onClick={() => setCurrentScreen(screen.id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className="size-4" />
                  {screen.label}
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAboutOpen(true)}
              className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              aria-label="Open about panel"
              title="About this simulation"
            >
              <Info className="size-5" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-6 md:hidden">
        <div className="grid grid-cols-5 gap-2" aria-label="Mobile app screens">
          {screens.map((screen) => {
            const Icon = screen.icon

            return (
              <button
                key={screen.id}
                type="button"
                onClick={() => setCurrentScreen(screen.id)}
                className={`grid aspect-square place-items-center rounded-lg border ${
                  currentScreen === screen.id
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                }`}
                aria-label={screen.label}
                title={screen.label}
              >
                <Icon className="size-5" />
              </button>
            )
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:py-16">
        {currentScreen === 'landing' && <LandingScreen onStart={() => setCurrentScreen('questions')} />}
        {currentScreen === 'questions' && (
          <QuestionsScreen
            profile={profile}
            onChange={setProfile}
            onComplete={() => setCurrentScreen('dashboard')}
          />
        )}
        {currentScreen === 'dashboard' && (
          <DashboardScreen
            profile={profile}
            onImport={(nextProfile) => {
              setProfile(nextProfile)
              setCurrentScreen('dashboard')
            }}
            onPlaybook={() => setCurrentScreen('playbook')}
          />
        )}
        {currentScreen === 'playbook' && (
          <PlaybookScreen
            profile={profile}
            onDashboard={() => setCurrentScreen('dashboard')}
            onFuture={() => setCurrentScreen('future')}
          />
        )}
        {currentScreen === 'future' && <FutureScreen profile={profile} onPlaybook={() => setCurrentScreen('playbook')} />}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>{disclaimer}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={goBack}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-200"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={currentIndex === screens.length - 1}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {isAboutOpen && <AboutPanel onClose={() => setIsAboutOpen(false)} />}
    </main>
  )
}

function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center">
      <div className="space-y-6">
        <p className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <ShieldCheck className="size-4" />
          Browser-only simulation
        </p>
        <div className="space-y-4">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 dark:text-white md:text-6xl">
            See your finances like a bank statement - without giving up your bank.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            No signup. No account linking. Your numbers never leave this browser.
          </p>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          Build my financial mirror
          <ArrowRight className="size-5" />
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Simulated checking</p>
            <p className="text-3xl font-semibold">$2,450</p>
          </div>
          <WalletCards className="size-8 text-emerald-600" />
        </div>
        <div className="space-y-3">
          {['Rent or mortgage', 'Fixed bills', 'Savings estimate', 'Spare money'].map((item, index) => (
            <div key={item} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-950">
              <span className="text-sm text-slate-600 dark:text-slate-300">{item}</span>
              <span className="font-medium">${[1400, 420, 190, 440][index]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function QuestionsScreen({
  profile,
  onChange,
  onComplete,
}: {
  profile: Profile
  onChange: (profile: Profile) => void
  onComplete: () => void
}) {
  const steps = useMemo(
    () =>
      [
        'income',
        'incomeType',
        'housing',
        'fixedBills',
        'hasDebt',
        ...(profile.hasDebt ? ['debtType', 'debtBalance', 'debtPayment'] : []),
        'savingsHabit',
        'spending',
        'goal',
        'risk',
        'household',
      ] as const,
    [profile.hasDebt],
  )
  const [stepIndex, setStepIndex] = useState(0)
  const currentStep = steps[Math.min(stepIndex, steps.length - 1)]
  const progress = ((Math.min(stepIndex, steps.length - 1) + 1) / steps.length) * 100
  const updateProfile = (patch: Partial<Profile>) => onChange({ ...profile, ...patch })

  const error = useMemo(() => {
    if (currentStep === 'income' && profile.monthlyIncome < 0) return 'Income cannot be negative.'
    if (currentStep === 'housing' && profile.housingCost < 0) return 'Rent or mortgage cannot be negative.'
    if (currentStep === 'fixedBills' && profile.otherFixedBills < 0) return 'Fixed bills cannot be negative.'
    if (currentStep === 'debtBalance' && profile.debtBalance < 0) return 'Debt balance cannot be negative.'
    if (currentStep === 'debtPayment' && profile.debtMinPayment < 0) return 'Minimum payment cannot be negative.'
    if (currentStep === 'spending' && profile.topSpendingCategories.length > 3) {
      return 'Pick up to 3 categories.'
    }

    return ''
  }, [currentStep, profile])

  const goToPreviousQuestion = () => setStepIndex((current) => Math.max(current - 1, 0))
  const goToNextQuestion = () => {
    if (error) return

    if (stepIndex >= steps.length - 1) {
      onComplete()
      return
    }

    setStepIndex((current) => Math.min(current + 1, steps.length - 1))
  }

  const toggleCategory = (category: SpendingCategory) => {
    const isSelected = profile.topSpendingCategories.includes(category)
    const nextCategories = isSelected
      ? profile.topSpendingCategories.filter((item) => item !== category)
      : [...profile.topSpendingCategories, category].slice(0, 3)

    updateProfile({ topSpendingCategories: nextCategories })
  }

  return (
    <div className="mx-auto w-full max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Question {Math.min(stepIndex, steps.length - 1) + 1} of {steps.length}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Saved in this browser</p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="min-h-72">
        {currentStep === 'income' && (
          <NumberQuestion
            id="monthlyIncome"
            label="What's your monthly take-home income?"
            value={profile.monthlyIncome}
            onChange={(monthlyIncome) => updateProfile({ monthlyIncome })}
          />
        )}

        {currentStep === 'incomeType' && (
          <SelectQuestion
            label="Is your income salaried, freelance, or a mix?"
            options={incomeTypeOptions}
            value={profile.incomeType}
            onChange={(incomeType) => updateProfile({ incomeType })}
          />
        )}

        {currentStep === 'housing' && (
          <NumberQuestion
            id="housingCost"
            label="What's your monthly rent or mortgage?"
            value={profile.housingCost}
            onChange={(housingCost) => updateProfile({ housingCost })}
          />
        )}

        {currentStep === 'fixedBills' && (
          <NumberQuestion
            id="otherFixedBills"
            label="Roughly how much do other fixed bills add up to?"
            helper="Utilities, insurance, subscriptions, and other predictable monthly bills."
            value={profile.otherFixedBills}
            onChange={(otherFixedBills) => updateProfile({ otherFixedBills })}
          />
        )}

        {currentStep === 'hasDebt' && (
          <SelectQuestion
            label="Do you currently have any debt?"
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
            value={profile.hasDebt ? 'yes' : 'no'}
            onChange={(value) =>
              updateProfile(
                value === 'yes'
                  ? { hasDebt: true, debtType: profile.debtType === 'none' ? 'credit_card' : profile.debtType }
                  : { hasDebt: false, debtType: 'none', debtBalance: 0, debtMinPayment: 0 },
              )
            }
          />
        )}

        {currentStep === 'debtType' && (
          <SelectQuestion
            label="What type?"
            options={debtTypeOptions}
            value={profile.debtType === 'none' ? 'credit_card' : profile.debtType}
            onChange={(debtType) => updateProfile({ debtType })}
          />
        )}

        {currentStep === 'debtBalance' && (
          <NumberQuestion
            id="debtBalance"
            label="Roughly what's the balance?"
            value={profile.debtBalance}
            onChange={(debtBalance) => updateProfile({ debtBalance })}
          />
        )}

        {currentStep === 'debtPayment' && (
          <NumberQuestion
            id="debtMinPayment"
            label="What's your minimum monthly payment?"
            value={profile.debtMinPayment}
            onChange={(debtMinPayment) => updateProfile({ debtMinPayment })}
          />
        )}

        {currentStep === 'savingsHabit' && (
          <SelectQuestion
            label="How would you describe your saving habit right now?"
            options={savingsHabitOptions}
            value={profile.currentSavingsHabit}
            onChange={(currentSavingsHabit) => updateProfile({ currentSavingsHabit })}
          />
        )}

        {currentStep === 'spending' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold">Pick up to 3 categories where most of your spare money goes</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Choose the areas that feel most true right now.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {spendingCategoryOptions.map((option) => {
                const selected = profile.topSpendingCategories.includes(option.value)

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleCategory(option.value)}
                    className={`rounded-lg border px-4 py-3 text-left font-medium transition ${
                      selected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {currentStep === 'goal' && (
          <SelectQuestion
            label="What's your main financial goal right now?"
            options={goalOptions}
            value={profile.primaryGoal}
            onChange={(primaryGoal) => updateProfile({ primaryGoal })}
          />
        )}

        {currentStep === 'risk' && (
          <SelectQuestion
            label="If your investments dropped 20% in a month, would you..."
            options={riskOptions}
            value={profile.riskTolerance}
            onChange={(riskTolerance) => updateProfile({ riskTolerance })}
          />
        )}

        {currentStep === 'household' && (
          <SelectQuestion
            label="Anyone else's finances tied to yours right now?"
            options={householdOptions}
            value={profile.household}
            onChange={(household) => updateProfile({ household })}
          />
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-h-5 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={goToPreviousQuestion}
            disabled={stepIndex === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-200"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <button
            type="button"
            onClick={goToNextQuestion}
            disabled={Boolean(error)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {stepIndex >= steps.length - 1 ? 'See dashboard' : 'Next'}
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function NumberQuestion({
  id,
  label,
  helper,
  value,
  onChange,
}: {
  id: string
  label: string
  helper?: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={id} className="block text-2xl font-semibold">
          {label}
        </label>
        {helper && <p className="mt-2 text-slate-600 dark:text-slate-300">{helper}</p>}
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-500">$</span>
        <input
          id={id}
          type="number"
          min="0"
          inputMode="decimal"
          value={moneyValue(value)}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full rounded-lg border border-slate-200 bg-white py-4 pl-9 pr-4 text-2xl font-semibold outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-emerald-950"
        />
      </div>
    </div>
  )
}

function SelectQuestion<TValue extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Array<{ value: TValue; label: string }>
  value: TValue
  onChange: (value: TValue) => void
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold">{label}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const selected = option.value === value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-lg border px-4 py-3 text-left font-medium transition ${
                selected
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DashboardScreen({
  profile,
  onImport,
  onPlaybook,
}: {
  profile: Profile
  onImport: (profile: Profile) => void
  onPlaybook: () => void
}) {
  const discretionary = discretionaryIncome(profile)
  const savings = currentSavingsRate(profile)
  const score = healthScore(profile)
  const transactions = simulatedTransactions(profile)
  const spendingData = spendingByCategory(profile)
  const endOfMonthSavings = Math.max(savings, 0)
  const checkingBalance = discretionary
  const chartSummary =
    spendingData.length > 0
      ? spendingData.map((item) => `${item.category}: ${formatCurrency(item.amount)}`).join(', ')
      : 'No simulated spending yet.'

  const downloadSnapshot = () => {
    const computedResults = {
      discretionaryIncome: discretionary,
      currentSavingsRate: savings,
      healthScore: score,
      simulatedTransactions: transactions,
      spendingByCategory: spendingData,
    }
    const blob = new Blob([JSON.stringify({ profile, computedResults }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'finpilot-snapshot.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const importSnapshot = async (file: File | undefined) => {
    if (!file) return

    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as { profile?: Partial<Profile> }

      if (parsed.profile) {
        onImport(normalizeProfile(parsed.profile))
      }
    } catch {
      window.alert('That snapshot could not be imported. Please choose a FinPilot JSON export.')
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Your dashboard</p>
          <h2 className="mt-2 text-3xl font-semibold">A simulated bank-app view of your month</h2>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            These figures are estimates from your answers. This is a simulation and does not connect to real accounts.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">
            <Upload className="size-4" />
            Import a snapshot
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => void importSnapshot(event.target.files?.[0])}
            />
          </label>
          <button
            type="button"
            onClick={downloadSnapshot}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
          >
            <Download className="size-4" />
            Download your snapshot
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_0.72fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Simulated checking</p>
              <p className="mt-2 text-3xl font-semibold">{formatCurrency(checkingBalance)}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <WalletCards className="size-5" />
            </span>
          </div>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-950">
                <span className="text-sm text-slate-600 dark:text-slate-300">{transaction.label}</span>
                <span className="font-medium">-{formatCurrency(transaction.amount)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Simulated savings</p>
              <p className="mt-2 text-3xl font-semibold">{formatCurrency(endOfMonthSavings)}</p>
            </div>
            <span className="grid size-10 place-items-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
              <PiggyBank className="size-5" />
            </span>
          </div>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-950">
              <span>Estimated monthly saving</span>
              <span className="font-medium text-slate-950 dark:text-white">{formatCurrency(savings)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-950">
              <span>End-of-month balance</span>
              <span className="font-medium text-slate-950 dark:text-white">{formatCurrency(endOfMonthSavings)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-950">
              <span>Estimated leftover</span>
              <span className="font-medium text-slate-950 dark:text-white">
                {formatCurrency(Math.max(discretionary - transactions.reduce((total, item) => total + item.amount, 0) - savings, 0))}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Financial mirror score</p>
          <div className="mt-4 flex items-end gap-3">
            <p className="text-5xl font-semibold">{score}</p>
            <p className="pb-2 text-sm text-slate-500 dark:text-slate-400">/ 100</p>
          </div>
          <p className="mt-3 inline-flex rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {healthLabel(score)}
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Encouraging by design: the score points toward habits you can adjust, not a judgment of your money life.
          </p>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Spending by category</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Simulated from the categories you selected.</p>
          </div>
          <div className="h-72" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <XAxis dataKey="category" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="amount" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Chart summary: {chartSummary}</p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xl font-semibold">Month snapshot</h3>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-950">
              <dt className="text-slate-500 dark:text-slate-400">Take-home income</dt>
              <dd className="font-medium">{formatCurrency(profile.monthlyIncome)}</dd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-950">
              <dt className="text-slate-500 dark:text-slate-400">Housing</dt>
              <dd className="font-medium">{formatCurrency(profile.housingCost)}</dd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-950">
              <dt className="text-slate-500 dark:text-slate-400">Fixed bills</dt>
              <dd className="font-medium">{formatCurrency(profile.otherFixedBills)}</dd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-950">
              <dt className="text-slate-500 dark:text-slate-400">Debt minimum</dt>
              <dd className="font-medium">{formatCurrency(profile.debtMinPayment)}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={onPlaybook}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            See your playbook
            <ArrowRight className="size-4" />
          </button>
        </section>
      </div>

      <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
              <LockKeyhole className="size-5" />
            </span>
            <div>
              <h3 className="text-xl font-semibold">Save & export</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Move your snapshot yourself with a JSON file.</p>
            </div>
          </div>
          <ul className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
            <li>All figures you enter stay in your browser.</li>
            <li>Nothing is sent to a server unless you choose to export a file yourself.</li>
            <li>No cookies, real bank linking, login, or analytics capture financial figures.</li>
          </ul>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-950">
            <Upload className="size-4" />
            Import a snapshot
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => void importSnapshot(event.target.files?.[0])}
            />
          </label>
          <button
            type="button"
            onClick={downloadSnapshot}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
          >
            <Download className="size-4" />
            Download your snapshot
          </button>
        </div>
      </section>

      <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        This app is an educational simulation. It is not a bank, is not FDIC-insured, and does not move real money.
      </p>
    </div>
  )
}

function PlaybookScreen({
  profile,
  onDashboard,
  onFuture,
}: {
  profile: Profile
  onDashboard: () => void
  onFuture: () => void
}) {
  const rules = matchingPlaybookRules(profile)
  const discretionary = discretionaryIncome(profile)

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Your playbook</p>
          <h2 className="mt-2 text-3xl font-semibold">A few principles that match your snapshot</h2>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            These book-inspired prompts are general education only. They are here to help you think clearly, not to tell you what to do.
          </p>
        </div>
        <button
          type="button"
          onClick={onFuture}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
        >
          See future you
          <ArrowRight className="size-4" />
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Monthly income</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(profile.monthlyIncome)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Discretionary estimate</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(discretionary)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Rules matched</p>
          <p className="mt-2 text-2xl font-semibold">{rules.length}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {rules.map((rule) => (
          <article
            key={`${rule.book}-${rule.principle}`}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-5 flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <BookOpen className="size-5" />
              </span>
              <div>
                <h3 className="text-xl font-semibold">{rule.book}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{rule.author}</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{rule.principle}</p>
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{rule.tip}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 md:grid-cols-[1fr_auto] md:items-center">
        <p>
          These are general educational principles, not personalized financial advice. Nothing here is personalized financial, investment, tax, or legal advice.
        </p>
        <button
          type="button"
          onClick={onDashboard}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-950"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </button>
      </section>
    </div>
  )
}

function FutureScreen({ profile, onPlaybook }: { profile: Profile; onPlaybook: () => void }) {
  const [years, setYears] = useState(10)
  const savings = currentSavingsRate(profile)
  const lift = estimatedPlaybookLift(profile)
  const data = projectionData(profile, years)
  const currentTotal = futureValue(savings, 5, years)
  const optimizedTotal = futureValue(savings + lift, 7, years)
  const difference = Math.max(optimizedTotal - currentTotal, 0)
  const targetYear = new Date().getFullYear() + years
  const chartSummary = `At ${years} years, the current path is about ${formatCurrency(
    Math.round(currentTotal),
  )}, while the playbook path is about ${formatCurrency(Math.round(optimizedTotal))}.`

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Future you</p>
          <h2 className="mt-2 text-3xl font-semibold">A simple projection of what could change</h2>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            This compares your current savings habit with an optimized path based on the playbook lift.
          </p>
        </div>
        <button
          type="button"
          onClick={onPlaybook}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <BookOpen className="size-4" />
          View playbook
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Current monthly saving</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(savings)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Estimated playbook lift</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(lift)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Optimized monthly saving</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(savings + lift)}</p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Projection horizon</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Monthly compounding with 5% and 7% annual assumptions.</p>
          </div>
          <div className="grid grid-cols-4 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-950" aria-label="Projection years">
            {[1, 5, 10, 20].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setYears(option)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  years === option
                    ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-300'
                    : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {option}y
              </button>
            ))}
          </div>
        </div>

        <div className="h-80" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={data} margin={{ top: 10, right: 18, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.25} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
              />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line
                type="monotone"
                dataKey="currentPath"
                name="Current path"
                stroke="#0891b2"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="optimizedPath"
                name="Playbook path"
                stroke="#059669"
                strokeWidth={3}
                dot={false}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
          <p>{chartSummary}</p>
          <p>
            If you follow the playbook, you could have roughly {formatCurrency(Math.round(difference))} more by {targetYear} than if nothing changes. A simplified projection, not a guarantee.
          </p>
        </div>
      </section>

      <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Nothing here is personalized financial, investment, tax, or legal advice. Consult a licensed professional for decisions specific to your situation.
      </p>
    </div>
  )
}

function AboutPanel({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-title"
    >
      <section className="max-h-full w-full max-w-2xl overflow-auto rounded-lg border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h2 id="about-title" className="text-2xl font-semibold">
                About FinPilot
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A private educational simulation.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-950"
            aria-label="Close about panel"
            title="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid gap-3 text-slate-600 dark:text-slate-300">
          <p className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
            This app is an educational simulation. It is not a bank, is not FDIC-insured, and does not move real money.
          </p>
          <p className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
            Nothing here is personalized financial, investment, tax, or legal advice. Consult a licensed professional for decisions specific to your situation.
          </p>
          <p className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
            All figures you enter stay in your browser. Nothing is sent to a server unless you choose to export a file yourself.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
        >
          Back to FinPilot
        </button>
      </section>
    </div>
  )
}
