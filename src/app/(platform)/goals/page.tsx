'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Target, Calendar, Award, DollarSign, X } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import GoalModal from '@/components/GoalModal'
import { GoalMock } from '@/lib/mockData'

export default function Goals() {
  const hasHydrated = useHasHydrated()

  // Zustand State
  const goals = useFinanceStore((state) => state.goals)
  const addGoal = useFinanceStore((state) => state.addGoal)
  const updateGoal = useFinanceStore((state) => state.updateGoal)
  const contributeToGoal = useFinanceStore((state) => state.contributeToGoal)
  const deleteGoal = useFinanceStore((state) => state.deleteGoal)
  const currency = useFinanceStore((state) => state.currency)
  const accounts = useFinanceStore((state) => state.accounts)

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<GoalMock | null>(null)

  // Contribute Inline Modal state
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null)
  const [contributionAmount, setContributionAmount] = useState('')

  if (!hasHydrated) {
    return (
      <div className="flex flex-col gap-6 animate-pulse text-left">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  // CRUD handlers
  const handleOpenAddModal = () => {
    setEditingGoal(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (goal: GoalMock) => {
    setEditingGoal(goal)
    setIsModalOpen(true)
  }

  const handleFormSubmit = (data: any) => {
    if (editingGoal) {
      updateGoal({
        ...editingGoal,
        ...data,
        deadline: new Date(data.deadline).toISOString(),
      })
      toast.success('Goal updated successfully')
    } else {
      addGoal({
        ...data,
        deadline: new Date(data.deadline).toISOString(),
      })
      toast.success('Goal created successfully')
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(id)
      toast.error('Goal deleted')
    }
  }

  // Contribute Handler
  const handleContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contributeGoalId || !contributionAmount) return

    const amount = parseFloat(contributionAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid positive amount')
      return
    }

    // Check checking account balance
    const checkingBalance = accounts.find((a) => a.type === 'Checking')?.balance || 0
    if (amount > checkingBalance) {
      toast.error(`Insufficient checking account funds. Available: ${formatCurrency(checkingBalance, currency)}`)
      return
    }

    contributeToGoal(contributeGoalId, amount)
    toast.success(`Contributed ${formatCurrency(amount, currency)} towards goal!`)
    
    // Reset states
    setContributeGoalId(null)
    setContributionAmount('')
  }

  // SVG parameters for circular progress
  const SVG_RADIUS = 34
  const SVG_CIRCUMFERENCE = 2 * Math.PI * SVG_RADIUS

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground text-sm font-light mt-0.5">Plan and fund your long-term projects.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-secondary hover:bg-secondary-hover text-secondary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-secondary/15"
        >
          <Plus className="w-4 h-4" /> Create Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const percent = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
          const isCompleted = goal.currentAmount >= goal.targetAmount
          const formattedPercent = Math.min(100, Math.round(percent))
          
          // Calculate stroke offset
          const strokeOffset = SVG_CIRCUMFERENCE - (SVG_CIRCUMFERENCE * Math.min(percent, 100)) / 100

          return (
            <motion.div
              layout
              key={goal.id}
              className="glass-card p-6 rounded-2xl border border-border/80 flex flex-col justify-between hover:border-secondary/20 transition-all duration-300 text-left shadow-xs"
            >
              <div>
                {/* Top: title and controls */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg text-foreground flex items-center gap-1.5">
                      {goal.name}
                      {isCompleted && (
                        <span title="Goal Met!">
                          <Award className="w-4.5 h-4.5 text-emerald-500 animate-bounce" />
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" /> Target: {new Date(goal.deadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(goal)}
                      className="p-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-1.5 border border-border rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Middle: circular progress & status */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative w-20 h-20 shrink-0">
                    <svg className="w-20 h-20 transform -rotate-90">
                      {/* Trail circle */}
                      <circle
                        cx="40"
                        cy="40"
                        r={SVG_RADIUS}
                        className="stroke-muted fill-transparent stroke-[6]"
                      />
                      {/* Active circle */}
                      <circle
                        cx="40"
                        cy="40"
                        r={SVG_RADIUS}
                        className="stroke-secondary fill-transparent stroke-[6] transition-all duration-700 ease-out"
                        strokeDasharray={SVG_CIRCUMFERENCE}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-black">
                      {formattedPercent}%
                    </div>
                  </div>

                  <div className="flex flex-col justify-center">
                    <span className="text-xs font-semibold text-muted-foreground">Current Savings</span>
                    <span className="text-2xl font-black text-foreground mt-0.5">
                      {formatCurrency(goal.currentAmount, currency)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold mt-1">
                      Target: {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom: Contribute */}
              {!isCompleted ? (
                <button
                  onClick={() => setContributeGoalId(goal.id)}
                  className="w-full bg-secondary/10 hover:bg-secondary/15 border border-secondary/20 text-secondary font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" /> Contribute Funds
                </button>
              ) : (
                <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                  Goal Fully Funded!
                </div>
              )}
            </motion.div>
          )
        })}

        {/* Empty State */}
        {goals.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed border-border/80 rounded-2xl">
            <div className="flex flex-col items-center justify-center gap-3">
              <Target className="w-10 h-10 text-muted-foreground/40 animate-bounce" />
              <h3 className="font-bold text-lg text-foreground">No Goals Set</h3>
              <p className="text-sm text-muted-foreground max-w-xs font-light">Set goals for vacation trips, computers, or savings indexes to build financial security.</p>
              <button
                onClick={handleOpenAddModal}
                className="bg-secondary hover:bg-secondary-hover text-secondary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-secondary/15 mt-2"
              >
                Create Your First Goal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contribute Dialog Overlay */}
      <AnimatePresence>
        {contributeGoalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setContributeGoalId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Form Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl z-10 text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">Contribute towards goal</h3>
                <button onClick={() => setContributeGoalId(null)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleContributeSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contribution-amount" className="text-xs font-semibold text-muted-foreground">Contribution Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    id="contribution-amount"
                    required
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    placeholder="50.00"
                    className="bg-muted border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-secondary transition-colors"
                  />
                  <span className="text-[10px] text-muted-foreground font-light">
                    This amount will be deducted from your Checking account.
                  </span>
                </div>
                <button
                  type="submit"
                  className="w-full bg-secondary hover:bg-secondary-hover text-secondary-foreground font-semibold py-2.5 rounded-xl text-xs transition-all"
                >
                  Confirm Contribution
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Goal Modal Form */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingGoal}
      />
    </div>
  )
}
