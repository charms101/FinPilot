'use client'

import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Download,
  LineChart,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  WalletCards,
} from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { defaultProfile, type Profile } from '@/lib/profile'

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

export default function FinPilotSimulation() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing')
  const [profile] = useState<Profile>(defaultProfile)
  const { theme, toggleTheme } = useTheme()

  const currentIndex = useMemo(
    () => screens.findIndex((screen) => screen.id === currentScreen),
    [currentScreen],
  )

  const goNext = () => setCurrentScreen(screens[Math.min(currentIndex + 1, screens.length - 1)].id)
  const goBack = () => setCurrentScreen(screens[Math.max(currentIndex - 1, 0)].id)

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
        {currentScreen === 'questions' && <QuestionsScreen profile={profile} />}
        {currentScreen === 'dashboard' && <DashboardScreen />}
        {currentScreen === 'playbook' && <PlaybookScreen />}
        {currentScreen === 'future' && <FutureScreen />}

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

function QuestionsScreen({ profile }: { profile: Profile }) {
  return (
    <PlaceholderPanel
      icon={WalletCards}
      title="Quick questions"
      body="This step will become the validated multi-step profile form in the next commit. The shared profile model is already in place."
      detail={`Starting monthly income: $${profile.monthlyIncome}`}
    />
  )
}

function DashboardScreen() {
  return (
    <PlaceholderPanel
      icon={BarChart3}
      title="Your dashboard"
      body="The next dashboard increment will show simulated checking, savings, spending charts, and export/import controls."
      detail="No real bank linking will be added."
    />
  )
}

function PlaybookScreen() {
  return (
    <PlaceholderPanel
      icon={BookOpen}
      title="Your playbook"
      body="Rules will live as data and render only when their conditions match the current profile."
      detail="Every tip will stay educational, not advisory."
    />
  )
}

function FutureScreen() {
  return (
    <PlaceholderPanel
      icon={LineChart}
      title="Future you"
      body="Projection math and a responsive chart will land after the calculations layer."
      detail="A simplified projection, not a guarantee."
    />
  )
}

function PlaceholderPanel({
  icon: Icon,
  title,
  body,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
  detail: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <Icon className="size-5" />
        </span>
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Simulation screen</p>
        </div>
      </div>
      <p className="max-w-2xl text-slate-600 dark:text-slate-300">{body}</p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <Download className="size-4" />
        {detail}
      </div>
    </div>
  )
}
