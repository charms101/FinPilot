'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, CreditCard, Calendar, BarChart3, TrendingUp } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { useFinanceStore } from '@/store/financeStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import SubscriptionModal from '@/components/SubscriptionModal'
import { SubscriptionMock } from '@/lib/mockData'

export default function Subscriptions() {
  const hasHydrated = useHasHydrated()

  // Zustand state
  const subscriptions = useFinanceStore((state) => state.subscriptions)
  const addSubscription = useFinanceStore((state) => state.addSubscription)
  const updateSubscription = useFinanceStore((state) => state.updateSubscription)
  const deleteSubscription = useFinanceStore((state) => state.deleteSubscription)
  const currency = useFinanceStore((state) => state.currency)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSub, setEditingSub] = useState<SubscriptionMock | null>(null)

  if (!hasHydrated) {
    return (
      <div className="flex flex-col gap-6 animate-pulse text-left">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-muted rounded-2xl" />
          <div className="h-32 bg-muted rounded-2xl" />
        </div>
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    )
  }

  // Calculations
  const totalMonthlySpending = subscriptions.reduce((sum, sub) => sum + sub.monthlyCost, 0)
  const totalAnnualSpending = totalMonthlySpending * 12

  // Chart Data
  const chartData = subscriptions.map(sub => ({
    name: sub.name,
    Cost: parseFloat(sub.monthlyCost.toFixed(2)),
  })).sort((a, b) => b.Cost - a.Cost)

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']

  const handleOpenAddModal = () => {
    setEditingSub(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (sub: SubscriptionMock) => {
    setEditingSub(sub)
    setIsModalOpen(true)
  }

  const handleFormSubmit = (data: any) => {
    if (editingSub) {
      updateSubscription({
        ...editingSub,
        ...data,
        nextBillingDate: new Date(data.nextBillingDate).toISOString(),
      })
      toast.success('Subscription updated successfully')
    } else {
      addSubscription({
        ...data,
        nextBillingDate: new Date(data.nextBillingDate).toISOString(),
      })
      toast.success('Subscription added successfully')
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      deleteSubscription(id)
      toast.error('Subscription deleted')
    }
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground text-sm font-light mt-0.5">Audit recurring charges and annual cost commitments.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-secondary hover:bg-secondary-hover text-secondary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-secondary/15"
        >
          <Plus className="w-4 h-4" /> Add Subscription
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4 text-left shadow-xs">
          <div className="p-3 bg-secondary/10 border border-secondary/20 text-secondary rounded-xl shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Total Monthly Cost</span>
            <span className="text-3xl font-black text-foreground mt-1 block">
              {formatCurrency(totalMonthlySpending, currency)}
            </span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center gap-4 text-left shadow-xs">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Annual Commitment</span>
            <span className="text-3xl font-black text-foreground mt-1 block">
              {formatCurrency(totalAnnualSpending, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Subscription Cards & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: cards */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider text-left pl-1">Active Subscriptions</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subscriptions.map((sub) => (
              <motion.div
                layout
                key={sub.id}
                className="glass-card p-5 rounded-2xl border border-border/80 hover:border-secondary/20 transition-all text-left shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <span className="font-bold text-base text-foreground">{sub.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(sub)}
                        className="p-1 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="p-1 border border-border rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-xl font-bold text-foreground">
                      {formatCurrency(sub.monthlyCost, currency)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-light">
                      / month
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 border-t border-border/40 pt-3 text-[10px] font-semibold text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Annual:</span>
                    <span className="text-foreground">{formatCurrency(sub.monthlyCost * 12, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Next Bill:</span>
                    <span className="text-foreground">
                      {new Date(sub.nextBillingDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {subscriptions.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border/80 rounded-2xl">
                <div className="flex flex-col items-center justify-center gap-2">
                  <CreditCard className="w-8 h-8 opacity-40 animate-bounce" />
                  <span className="text-sm font-semibold">No active subscriptions</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Chart */}
        {subscriptions.length > 0 && (
          <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-border/80 flex flex-col gap-4 text-left h-fit shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground">Monthly Breakdown</h2>
                <p className="text-[10px] text-muted-foreground font-light">Comparison of recurring charges</p>
              </div>
              <BarChart3 className="w-4 h-4 text-blue-500" />
            </div>

            <div className="h-[240px] w-full select-none mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: 'hsl(var(--foreground))',
                    }}
                    formatter={(value: any) => formatCurrency(value, currency)}
                  />
                  <Bar dataKey="Cost" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Modal Form */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingSub}
      />
    </div>
  )
}
