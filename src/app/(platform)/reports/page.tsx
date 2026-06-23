'use client'

import React, { useState } from 'react'
import { FileText, Download, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { formatCurrency } from '@/lib/utils'
import { useAppUser } from '@/components/AuthProvider'
import { toast } from 'sonner'

export default function Reports() {
  const hasHydrated = useHasHydrated()
  const { user: authUser } = useAppUser()

  // Zustand State
  const transactions = useFinanceStore((state) => state.transactions)
  const budgets = useFinanceStore((state) => state.budgets)
  const currency = useFinanceStore((state) => state.currency)
  const user = useFinanceStore((state) => state.user)

  // Local state
  const [isGenerating, setIsGenerating] = useState(false)

  if (!hasHydrated) {
    return (
      <div className="flex flex-col gap-6 animate-pulse text-left">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-[250px] bg-muted rounded-2xl" />
      </div>
    )
  }

  // Monthly stats
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthName = new Date().toLocaleString('en-US', { month: 'long' })

  const monthlyTxs = transactions.filter((tx) => {
    const d = new Date(tx.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const incomeSum = monthlyTxs
    .filter((tx) => tx.type === 'INCOME')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const expenseSum = monthlyTxs
    .filter((tx) => tx.type === 'EXPENSE')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const netSavings = incomeSum - expenseSum
  const savingsRate = incomeSum > 0 ? ((netSavings / incomeSum) * 100).toFixed(1) : '0.0'

  const handleGeneratePdf = async () => {
    setIsGenerating(true)
    const toastId = toast.loading('Generating your PDF report...')

    try {
      const response = await fetch('/api/reports/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions,
          budgets,
          currency,
          user: {
            fullName: authUser?.fullName || user?.name || 'Guest User',
            primaryEmail: authUser?.primaryEmail || user?.email || 'guest@finpilot.ai',
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Convert response to blob
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      
      // Create download link element
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `FinPilot_Report_${monthName}_${currentYear}.pdf`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      toast.success('Report downloaded successfully!', { id: toastId })
    } catch (err: any) {
      console.error(err)
      toast.error('Error generating PDF report: ' + err.message, { id: toastId })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground text-sm font-light mt-0.5">Export statement records to printable formats.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Right: CTA box */}
        <div className="lg:col-span-4 bg-card border border-border/80 p-6 rounded-2xl text-left flex flex-col gap-6 shadow-xs">
          <div className="p-4 bg-secondary/5 border border-secondary/15 rounded-2xl w-fit text-secondary">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Monthly Wealth Statement</h2>
            <p className="text-xs text-muted-foreground font-light mt-1">
              Download a comprehensive ledger covering {monthName} {currentYear} transaction accounts, budget thresholds, and savings metrics.
            </p>
          </div>

          <button
            onClick={handleGeneratePdf}
            disabled={isGenerating || monthlyTxs.length === 0}
            className="bg-secondary hover:bg-secondary-hover disabled:opacity-55 text-secondary-foreground font-semibold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-secondary/10 w-full"
          >
            <Download className="w-4 h-4" /> {isGenerating ? 'Generating...' : 'Download PDF'}
          </button>

          {monthlyTxs.length === 0 && (
            <span className="text-[10px] text-destructive font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> No transactions registered for this month yet.
            </span>
          )}
        </div>

        {/* Left: Summary cards preview */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider text-left pl-1">Statement Preview ({monthName})</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border/80 p-5 rounded-2xl text-left shadow-xs">
              <span className="text-xs text-muted-foreground font-semibold">Total Income Registered</span>
              <span className="text-2xl font-bold text-emerald-500 block mt-1">
                {formatCurrency(incomeSum, currency)}
              </span>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-2xl text-left shadow-xs">
              <span className="text-xs text-muted-foreground font-semibold">Total Expenses Registered</span>
              <span className="text-2xl font-bold text-rose-500 block mt-1">
                {formatCurrency(expenseSum, currency)}
              </span>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-2xl text-left shadow-xs">
              <span className="text-xs text-muted-foreground font-semibold">Net Statement Savings</span>
              <span className="text-2xl font-bold text-foreground block mt-1">
                {formatCurrency(netSavings, currency)}
              </span>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-2xl text-left shadow-xs">
              <span className="text-xs text-muted-foreground font-semibold">Monthly Savings Ratio</span>
              <span className="text-2xl font-bold text-secondary block mt-1">
                {savingsRate}%
              </span>
            </div>
          </div>

          {/* Table Preview */}
          <div className="glass-card border border-border/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-border/60 bg-muted/10 flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Ledger Preview (Sample)</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">{monthlyTxs.length} items total</span>
            </div>
            <div className="divide-y divide-border/40 select-none">
              {monthlyTxs.slice(0, 4).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-6 py-3.5 text-left">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">{tx.merchant}</span>
                    <span className="text-[10px] text-muted-foreground font-light">{tx.category}</span>
                  </div>
                  <span className={`text-xs font-bold ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-foreground'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              ))}

              {monthlyTxs.length === 0 && (
                <div className="py-12 text-center text-muted-foreground font-medium text-xs">
                  <HelpCircle className="w-6 h-6 opacity-40 mx-auto mb-2 animate-bounce" />
                  No transactions registered for this month.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
