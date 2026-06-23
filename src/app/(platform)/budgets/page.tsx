'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Calendar, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import BudgetModal from '@/components/BudgetModal'
import { BudgetMock } from '@/lib/mockData'

export default function Budgets() {
  const hasHydrated = useHasHydrated()

  // Zustand state
  const budgets = useFinanceStore((state) => state.budgets)
  const addBudget = useFinanceStore((state) => state.addBudget)
  const updateBudget = useFinanceStore((state) => state.updateBudget)
  const deleteBudget = useFinanceStore((state) => state.deleteBudget)
  const recalculateBudgetSpending = useFinanceStore((state) => state.recalculateBudgetSpending)
  const currency = useFinanceStore((state) => state.currency)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetMock | null>(null)

  // Recalculate on load to ensure sync
  useEffect(() => {
    if (hasHydrated) {
      recalculateBudgetSpending()
    }
  }, [hasHydrated, recalculateBudgetSpending])

  if (!hasHydrated) {
    return (
      <div className="flex flex-col gap-6 animate-pulse text-left">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-44 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  const handleOpenAddModal = () => {
    setEditingBudget(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (budget: BudgetMock) => {
    setEditingBudget(budget)
    setIsModalOpen(true)
  }

  const handleFormSubmit = (data: any) => {
    const isCategoryExists = budgets.some(b => b.category.toLowerCase() === data.category.toLowerCase() && b.id !== editingBudget?.id)
    if (isCategoryExists) {
      toast.error(`A budget for "${data.category}" already exists. Delete or edit it instead.`)
      return
    }

    if (editingBudget) {
      updateBudget({
        ...editingBudget,
        ...data,
      })
      toast.success('Budget limit updated')
    } else {
      addBudget(data)
      toast.success('Budget created successfully')
    }
    recalculateBudgetSpending()
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteBudget(id)
      toast.error('Budget deleted')
    }
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground text-sm font-light mt-0.5">Control your monthly outlays by setting category caps.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-secondary hover:bg-secondary-hover text-secondary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-secondary/15"
        >
          <Plus className="w-4 h-4" /> Create Budget
        </button>
      </div>

      {/* Grid: Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => {
          const percent = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0
          const formattedPercent = Math.min(100, Math.round(percent))
          
          // Progress bar color based on percentage
          let progressColor = 'bg-success'
          let textColor = 'text-success'
          let borderGlow = 'hover:border-success/30'
          let alertIcon = null

          if (percent >= 100) {
            progressColor = 'bg-destructive'
            textColor = 'text-destructive'
            borderGlow = 'hover:border-destructive/30'
            alertIcon = (
              <span title="Budget Exceeded!">
                <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" />
              </span>
            )
          } else if (percent >= 85) {
            progressColor = 'bg-warning'
            textColor = 'text-warning'
            borderGlow = 'hover:border-warning/30'
            alertIcon = (
              <span title="Approaching Limit">
                <AlertTriangle className="w-4 h-4 text-warning" />
              </span>
            )
          }

          return (
            <motion.div
              layout
              key={budget.id}
              className={`glass-card p-6 rounded-2xl border border-border/80 flex flex-col justify-between transition-all duration-300 ${borderGlow} text-left shadow-xs relative`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-foreground">{budget.category}</span>
                    {alertIcon}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(budget)}
                      className="p-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-1.5 border border-border rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-2xl font-black tracking-tight text-foreground">
                    {formatCurrency(budget.spent, currency)}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    of {formatCurrency(budget.limit, currency)} limit
                  </span>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full bg-muted rounded-full h-3 mb-2 overflow-hidden border border-border/20">
                  <div
                    style={{ width: `${formattedPercent}%` }}
                    className={`h-full ${progressColor} transition-all duration-500 ease-out`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold mt-2">
                <span className={textColor}>
                  {Math.round(percent)}% spent
                </span>
                <span className="text-muted-foreground font-light">
                  {budget.limit - budget.spent > 0
                    ? `${formatCurrency(budget.limit - budget.spent, currency)} remaining`
                    : `${formatCurrency(Math.abs(budget.limit - budget.spent), currency)} over limit`}
                </span>
              </div>
            </motion.div>
          )
        })}

        {budgets.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed border-border/80 rounded-2xl">
            <div className="flex flex-col items-center justify-center gap-3">
              <Calendar className="w-10 h-10 text-muted-foreground/40 animate-bounce" />
              <h3 className="font-bold text-lg text-foreground">No Budgets Created</h3>
              <p className="text-sm text-muted-foreground max-w-xs font-light">Set monthly spending limits for food, entertainment, utilities, etc., to avoid debt traps.</p>
              <button
                onClick={handleOpenAddModal}
                className="bg-secondary hover:bg-secondary-hover text-secondary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-secondary/15 mt-2"
              >
                Create Your First Budget
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
