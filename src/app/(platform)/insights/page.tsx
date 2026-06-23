'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, PiggyBank, DollarSign } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { formatCurrency } from '@/lib/utils'

export default function Insights() {
  const hasHydrated = useHasHydrated()

  // Zustand State
  const transactions = useFinanceStore((state) => state.transactions)
  const budgets = useFinanceStore((state) => state.budgets)
  const currency = useFinanceStore((state) => state.currency)

  if (!hasHydrated) {
    return (
      <div className="flex flex-col gap-6 animate-pulse text-left">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-muted rounded-2xl" />
          <div className="h-40 bg-muted rounded-2xl" />
        </div>
      </div>
    )
  }

  // 1. Calculations
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthTxs = transactions.filter((tx) => {
    const d = new Date(tx.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  // Group by category to find biggest expense category
  const categoryTotals: Record<string, number> = {}
  let totalExpenses = 0
  let totalIncome = 0

  monthTxs.forEach((tx) => {
    if (tx.type === 'EXPENSE') {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount
      totalExpenses += tx.amount
    } else {
      totalIncome += tx.amount
    }
  })

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])
  const biggestExpenseCategory = sortedCategories[0]?.[0] || 'N/A'
  const biggestExpenseAmount = sortedCategories[0]?.[1] || 0

  // Savings rate
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : '0.0'

  // Budget warnings
  const exceededBudgets = budgets.filter((b) => b.spent >= b.limit)
  const warningBudgets = budgets.filter((b) => b.spent >= b.limit * 0.85 && b.spent < b.limit)

  // Generate Suggested Savings Opportunities
  const foodSpent = categoryTotals['Food'] || 0
  const coffeeTxs = transactions.filter(t => t.merchant.toLowerCase() === 'starbucks' && new Date(t.date).getMonth() === currentMonth)
  const coffeeSum = coffeeTxs.reduce((sum, t) => sum + t.amount, 0)

  // Render Insights
  const insightsList = [
    {
      id: 'ins_1',
      title: 'Biggest Outflow Category',
      icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
      desc: `Your highest spending category this month is **${biggestExpenseCategory}**, totaling **${formatCurrency(biggestExpenseAmount, currency)}**. This comprises **${totalExpenses > 0 ? ((biggestExpenseAmount / totalExpenses) * 100).toFixed(0) : 0}%** of your total monthly expenditures.`,
      action: 'Consider setting a tighter budget on this category to regulate flow.',
      color: 'border-l-purple-500',
    },
    {
      id: 'ins_2',
      title: 'Savings Efficiency Index',
      icon: <PiggyBank className="w-5 h-5 text-emerald-500" />,
      desc: `You saved **${savingsRate}%** of your total monthly income. Total deposited income: **${formatCurrency(totalIncome, currency)}** vs total expenses: **${formatCurrency(totalExpenses, currency)}**.`,
      action: savingsRate && parseFloat(savingsRate) > 50 ? 'Outstanding! Keep this up to hit your savings milestones early.' : 'Try reducing non-essential shopping to increase your rate above 20%.',
      color: 'border-l-emerald-500',
    },
    {
      id: 'ins_3',
      title: 'Budget Alert Thresholds',
      icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
      desc: exceededBudgets.length > 0 
        ? `You have exceeded your monthly limit for **${exceededBudgets.map(b => b.category).join(', ')}** budget groups.`
        : warningBudgets.length > 0 
        ? `Warning: Your **${warningBudgets.map(b => b.category).join(', ')}** budgets are at over 85% of their limits.`
        : 'Congratulations! All category budgets are currently operating within healthy boundaries.',
      action: exceededBudgets.length > 0 
        ? 'Divert checking funds or pause shopping categories immediately.'
        : 'Monitor bills and utility caps for the remainder of the cycle.',
      color: exceededBudgets.length > 0 ? 'border-l-rose-500' : 'border-l-blue-500',
    },
    {
      id: 'ins_4',
      title: 'Suggested Savings Opportunity',
      icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
      desc: coffeeSum > 0 
        ? `We detected **${coffeeTxs.length}** transactions at **Starbucks** totaling **${formatCurrency(coffeeSum, currency)}** this month.`
        : `Shopping spending represents **${totalExpenses > 0 ? (((categoryTotals['Shopping'] || 0) / totalExpenses) * 100).toFixed(0) : 0}%** of your monthly cash leaks.`,
      action: coffeeSum > 0 
        ? `Reducing coffee purchases by half would secure an extra **${formatCurrency(coffeeSum / 2, currency)}** for your Emergency Fund.`
        : 'Consider postponing large retail checkout purchases until next month.',
      color: 'border-l-amber-500',
    }
  ]

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="text-left flex items-center gap-2">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl text-white">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">FinPilot Insights</h1>
          <p className="text-muted-foreground text-sm font-light mt-0.5">AI-generated wealth insights and savings alerts.</p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insightsList.map((ins, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={ins.id}
            className={`glass-card p-6 rounded-2xl border border-border/80 border-l-4 ${ins.color} text-left flex flex-col justify-between hover:scale-[1.01] transition-all shadow-xs`}
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                {ins.icon}
                <h3 className="font-bold text-foreground">{ins.title}</h3>
              </div>
              <p
                className="text-sm text-muted-foreground font-light leading-relaxed mb-4"
                dangerouslySetInnerHTML={{ __html: ins.desc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
              />
            </div>
            <div className="bg-muted p-3.5 rounded-xl border border-border/40 text-xs font-semibold text-foreground/90 leading-snug">
              💡 {ins.action}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
