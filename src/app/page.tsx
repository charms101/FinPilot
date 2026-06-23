'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  TrendingUp,
  Brain,
  Calendar,
  Target,
  FileText,
  Scan,
  Bell,
  ArrowRight,
  Shield,
  Zap,
  Activity,
  DollarSign,
  PieChart,
  User,
  Menu,
  X,
  Sparkles
} from 'lucide-react'
import { useAppAuth, useMockAuth, isClerkConfigured } from '@/components/AuthProvider'

// Feature item type
interface FeatureItem {
  icon: React.ReactNode
  title: string
  desc: string
}

export default function LandingPage() {
  const router = useRouter()
  const { isSignedIn } = useAppAuth()
  const { signIn } = useMockAuth()

  // State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginName, setLoginName] = useState('')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai' | 'scanner'>('dashboard')

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard')
    }
  }, [isSignedIn, router])

  const handleAuthAction = () => {
    if (isClerkConfigured) {
      router.push('/login')
    } else {
      setShowLoginModal(true)
    }
  }

  const handleGuestLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginName) return

    signIn(loginEmail, loginName)
    setShowLoginModal(false)
    router.push('/dashboard')
  }

  const features: FeatureItem[] = [
    {
      icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
      title: "Expense Tracking",
      desc: "Automatically categorize transactions and analyze your cash flow trends instantly."
    },
    {
      icon: <Brain className="w-6 h-6 text-purple-500" />,
      title: "AI Financial Assistant",
      desc: "A ChatGPT-like co-pilot that answers queries, flags leaks, and drafts smart saving strategies."
    },
    {
      icon: <Calendar className="w-6 h-6 text-emerald-500" />,
      title: "Budget Planner",
      desc: "Set monthly caps on dining, bills, and entertainment, and get real-time warning indicators."
    },
    {
      icon: <Target className="w-6 h-6 text-amber-500" />,
      title: "Goal Milestones",
      desc: "Define savings targets like Japan Trip or Emergency Fund with animated visual feedback."
    },
    {
      icon: <FileText className="w-6 h-6 text-cyan-500" />,
      title: "Monthly Reports",
      desc: "Generate professional PDF statements covering income breakdowns and budget performance."
    },
    {
      icon: <Scan className="w-6 h-6 text-indigo-500" />,
      title: "Receipt Scanner",
      desc: "Scan bills using client-side OCR (Tesseract.js) to auto-extract merchants, dates, and amounts."
    },
    {
      icon: <Bell className="w-6 h-6 text-rose-500" />,
      title: "Subscription Calculator",
      desc: "Expose hidden Netflix, Spotify, or gym subscriptions and calculate your annual expense projections."
    }
  ]

  const testimonials = [
    {
      quote: "FinPilot AI completely changed how I budget. The AI Assistant feels like having a staff accountant in my pocket 24/7.",
      name: "Marcus Vance",
      role: "Lead Software Architect",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120"
    },
    {
      quote: "The receipt scanner is magic! I just take a photo and it instantly drafts a fully-filled transaction inside my food budget.",
      name: "Sophia Sterling",
      role: "Product Designer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120"
    },
    {
      quote: "No complex spreadsheets anymore. The clean cash-flow graphs and budget limits give me complete control over my finances.",
      name: "Devon Chen",
      role: "Freelance Creative",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120"
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-black text-slate-100 overflow-x-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-800/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              FinPilot <span className="text-blue-500 font-extrabold text-sm align-super">AI</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-white transition-colors">About</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={handleAuthAction}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5"
            >
              Login
            </button>
            <button
              onClick={handleAuthAction}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm px-4 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:scale-102"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-16 left-0 right-0 bg-slate-900 border-b border-slate-800 p-6 z-40"
          >
            <div className="flex flex-col gap-4 text-center font-medium">
              <a
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-300 hover:text-white py-2"
              >
                Features
              </a>
              <a
                href="#demo"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-300 hover:text-white py-2"
              >
                Interactive Demo
              </a>
              <a
                href="#pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-300 hover:text-white py-2"
              >
                Pricing
              </a>
              <hr className="border-slate-800" />
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleAuthAction()
                }}
                className="text-slate-300 hover:text-white py-2"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleAuthAction()
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-xl transition-all"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-32 md:pb-36 z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-400 shadow-md">
            <Zap className="w-3.5 h-3.5" /> Introducing Next-Gen Personal Wealth AI
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-tight md:leading-tight">
            Smarter Money Management <br className="hidden sm:block" />
            with <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 bg-clip-text text-transparent">FinPilot AI</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl font-light">
            Track spending, manage budgets, analyze finances, and receive personalized AI insights with the ultimate production-grade co-pilot.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <button
              onClick={handleAuthAction}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group shadow-xl shadow-blue-600/20 hover:scale-102"
            >
              Start Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#demo"
              className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-900 border border-slate-800 text-slate-200 hover:text-white font-medium px-8 py-3.5 rounded-xl transition-all text-center"
            >
              See Interactive Preview
            </a>
          </div>
        </motion.div>

        {/* Animated charts / Floating cards preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 md:mt-24 relative max-w-5xl mx-auto rounded-2xl border border-slate-900 bg-zinc-950/40 p-4 md:p-6 overflow-hidden"
        >
          {/* Glass header bar */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-slate-500 font-medium ml-2 font-mono">dashboard_preview_v2.1</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-400 font-medium">
              Demo Active
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Net worth card */}
            <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-xl flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Net Worth</span>
              <span className="text-3xl font-bold">$28,680.20</span>
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mt-2">
                <TrendingUp className="w-3.5 h-3.5" /> +12.4% this month
              </div>
            </div>

            {/* AI message card */}
            <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-xl flex flex-col justify-between md:col-span-2 group">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-300">FinPilot Advisor</span>
                  <p className="text-sm text-slate-400 font-light">
                    &quot;Your biggest spending increase this week was at **Starbucks** (+42%). Consider utilizing your food budget capping options below to save roughly **$120.00** this month.&quot;
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 text-xs font-semibold">
                <span className="bg-blue-900/30 text-blue-400 border border-blue-800/40 px-2.5 py-1 rounded-md">Food Budget limit: $600</span>
                <span className="bg-amber-900/30 text-amber-400 border border-amber-800/40 px-2.5 py-1 rounded-md">Spent: 81%</span>
              </div>
            </div>
          </div>

          {/* Simple Vector Mock Chart */}
          <div className="mt-6 bg-slate-900/20 border border-slate-850 rounded-xl p-6 h-48 flex items-end justify-between gap-2 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent pointer-events-none" />
            {Array.from({ length: 12 }).map((_, i) => {
              const heights = [30, 45, 60, 50, 75, 90, 85, 110, 130, 115, 140, 160]
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div
                    style={{ height: `${heights[i]}px` }}
                    className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-md opacity-70 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-blue-500/10 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 font-medium">Month {i+1}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 md:py-28 border-t border-slate-900">
        <div className="text-center flex flex-col items-center gap-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything You Need to Command Your Wealth</h2>
          <p className="text-slate-400 max-w-xl font-light">
            FinPilot AI implements full-stack tools out-of-the-box, ensuring production quality and clean data flows.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <motion.div
              whileHover={{ y: -5 }}
              key={idx}
              className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl hover:border-slate-800 transition-colors flex flex-col gap-4 text-left"
            >
              <div className="bg-black p-3 rounded-xl w-fit border border-slate-900">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-100">{feat.title}</h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interactive Tabs Section */}
      <section id="demo" className="bg-slate-900/20 py-20 md:py-28 border-t border-b border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 flex flex-col gap-6 text-left">
              <span className="text-xs font-bold uppercase text-blue-500 tracking-widest">Interactive Preview</span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Explore the Platform Controls</h2>
              <p className="text-slate-400 font-light leading-relaxed">
                Click the states below to preview how FinPilot coordinates financial tools seamlessly using clean Zustand state.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-950/20 border-blue-500/40 text-blue-400'
                      : 'bg-black border-slate-900 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <Activity className="w-5 h-5" />
                  <div>
                    <h4 className="font-semibold text-sm">Interactive Wealth Dashboard</h4>
                    <p className="text-xs text-slate-500 font-light mt-0.5">Visualize income flows, net worth adjustments and budget alerts.</p>
                  </div>
                </button>
 
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    activeTab === 'ai'
                      ? 'bg-blue-950/20 border-blue-500/40 text-blue-400'
                      : 'bg-black border-slate-900 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <Brain className="w-5 h-5" />
                  <div>
                    <h4 className="font-semibold text-sm">Conversational AI Chat</h4>
                    <p className="text-xs text-slate-500 font-light mt-0.5">Ask questions about food costs, subscriptions, and savings.</p>
                  </div>
                </button>
 
                <button
                  onClick={() => setActiveTab('scanner')}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    activeTab === 'scanner'
                      ? 'bg-blue-950/20 border-blue-500/40 text-blue-400'
                      : 'bg-black border-slate-900 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <Scan className="w-5 h-5" />
                  <div>
                    <h4 className="font-semibold text-sm">Tesseract.js OCR Scanner</h4>
                    <p className="text-xs text-slate-500 font-light mt-0.5">Auto-parse merchant totals and map categories dynamically.</p>
                  </div>
                </button>
              </div>
            </div>
 
            <div className="lg:col-span-7 bg-black border border-slate-900 rounded-2xl p-6 h-[400px] flex flex-col relative overflow-hidden">
              
              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col h-full justify-between text-left"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-semibold text-slate-400 font-mono">Overview / Cash Flow</span>
                        <div className="flex gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850">
                          <span className="text-xs text-slate-400 block mb-1">Monthly Income</span>
                          <span className="text-2xl font-bold text-emerald-400">$5,850.00</span>
                        </div>
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850">
                          <span className="text-xs text-slate-400 block mb-1">Monthly Expenses</span>
                          <span className="text-2xl font-bold text-rose-400">$1,385.59</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-slate-400">Budget Progress Alerts</span>
                      <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-[81%]" />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                        <span>Food Limit: $600</span>
                        <span className="text-yellow-400">Spent: $485.50 (81%)</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'ai' && (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col h-full justify-between text-left"
                  >
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-900">
                      <div className="w-6 h-6 rounded bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-xs">AI</div>
                      <span className="text-xs font-semibold">FinPilot Assistant v1.0</span>
                    </div>

                    <div className="flex-1 flex flex-col gap-4 py-4 overflow-y-auto">
                      <div className="bg-slate-900/80 p-3 rounded-xl text-xs max-w-[85%] self-end text-slate-300 font-light border border-slate-800">
                        Am I overspending this month?
                      </div>
                      <div className="bg-slate-900/40 p-3 rounded-xl text-xs max-w-[85%] self-start text-blue-400 font-light border border-slate-850 flex gap-2">
                        <Brain className="w-4 h-4 shrink-0" />
                        <div>
                          Based on 100 transactions, your income is **$5,850** and expenses are **$1,385.59**. Your savings rate is **76%** (excellent). 
                          <span className="block mt-1 text-slate-400 text-[11px] font-semibold">⚠️ Alert: Shopping budget is at 97%.</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-900 pt-3">
                      <input
                        type="text"
                        disabled
                        placeholder="Ask FinPilot AI... (Sign up to chat)"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </motion.div>
                )}

                {activeTab === 'scanner' && (
                  <motion.div
                    key="scanner"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col h-full justify-between text-left"
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-400 font-mono mb-4 block">OCR Extract Preview</span>
                      <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-900/20 hover:bg-slate-900/40 transition-colors">
                        <Scan className="w-8 h-8 text-blue-500 animate-pulse" />
                        <span className="text-xs font-bold">Select Receipt Image</span>
                        <span className="text-[10px] text-slate-500 font-light">Tesseract.js will analyze instantly</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-850 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Merchant</span>
                        <span className="font-semibold">Starbucks</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Total Amount</span>
                        <span className="font-semibold text-emerald-400">$12.45</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Auto Category</span>
                        <span className="font-semibold text-blue-400">Food</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center flex flex-col items-center gap-4 mb-16">
          <span className="text-xs font-bold uppercase text-blue-500 tracking-widest">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Loved by Engineers and Wealth Managers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <div key={idx} className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between text-left">
              <p className="text-sm text-slate-300 italic font-light leading-relaxed mb-6">
                &quot;{test.quote}&quot;
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={test.avatar}
                  alt={test.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-800"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{test.name}</h4>
                  <span className="text-xs text-slate-500 font-medium">{test.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-black py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-300">FinPilot AI</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <span>&copy; {new Date().getFullYear()} FinPilot AI. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Guest Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-black border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 text-left"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600/10 p-2 rounded-xl border border-blue-500/20 text-blue-500">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">Welcome to FinPilot AI</h3>
                </div>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-400 font-light mb-6">
                Enter your details to log in instantly. Since Clerk auth is in guest mode, this will create a local mock session with 100 seeded transactions.
              </p>

              <form onSubmit={handleGuestLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-name" className="text-xs font-semibold text-slate-300">Full Name</label>
                  <input
                    type="text"
                    id="modal-name"
                    required
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="bg-black border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-email" className="text-xs font-semibold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    id="modal-email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="alex.mercer@finpilot.ai"
                    className="bg-black border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 mt-2 text-sm"
                >
                  Launch Dashboard
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
