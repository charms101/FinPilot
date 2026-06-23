'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ShoppingBag,
  ArrowUpDown,
  Percent,
  CheckCircle,
  HelpCircle,
  Plus
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  Legend
} from 'recharts'
import { useFinanceStore } from '@/store/financeStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default function Dashboard() {
  const hasHydrated = useHasHydrated()

  // Store data
  const user = useFinanceStore((state) => state.user)
  const accounts = useFinanceStore((state) => state.accounts)
  const transactions = useFinanceStore((state) => state.transactions)
  const budgets = useFinanceStore((state) => state.budgets)
  const currency = useFinanceStore((state) => state.currency)

  if (!hasHydrated) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[350px] bg-muted rounded-2xl" />
          <div className="h-[350px] bg-muted rounded-2xl" />
        </div>
      </div>
    )
  }

  // 1. Calculations
  const checkingBalance = accounts.find((a) => a.type === 'Checking')?.balance || 0
  const savingsBalance = accounts.find((a) => a.type === 'Savings')?.balance || 0
  const creditCardBalance = accounts.find((a) => a.type === 'Credit Card')?.balance || 0

  const totalBalance = checkingBalance + savingsBalance
  // Credit card balance is stored as a negative number in mockData (debt), so we add it
  const netWorth = totalBalance + creditCardBalance

  // Compute current month income and expenses
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyIncome = transactions
    .filter((tx) => {
      const d = new Date(tx.date)
      return tx.type === 'INCOME' && d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .reduce((sum, tx) => sum + tx.amount, 0)

  const monthlyExpenses = transactions
    .filter((tx) => {
      const d = new Date(tx.date)
      return tx.type === 'EXPENSE' && d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .reduce((sum, tx) => sum + tx.amount, 0)

  const savingsRate = monthlyIncome > 0
    ? Math.max(0, parseFloat(((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1)))
    : 0

  // 2. Recent Transactions (latest 5)
  const recentTransactions = transactions.slice(0, 5)

  // 3. Category Data for Pie Chart
  const categoryTotals: Record<string, number> = {}
  transactions
    .filter((tx) => {
      const d = new Date(tx.date)
      return tx.type === 'EXPENSE' && d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .forEach((tx) => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount
    })

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  })).sort((a, b) => b.value - a.value)

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B']

  // 4. Daily Balance Trend for Area Chart (past 30 days)
  const getDailyBalanceData = () => {
    const data = []
    let currentBal = netWorth
    const dates = []
    
    // Sort transactions ascending to compute running balances correctly
    const txsIn30Days = transactions
      .filter((tx) => {
        const diffTime = Math.abs(new Date().getTime() - new Date(tx.date).getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 30
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Create daily points
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      
      // Calculate transactions on this day
      const txsOnDay = txsIn30Days.filter((tx) => {
        const txDate = new Date(tx.date)
        return txDate.getDate() === d.getDate() && txDate.getMonth() === d.getMonth()
      })

      // Adjust running balance
      txsOnDay.forEach((tx) => {
        const change = tx.type === 'INCOME' ? tx.amount : -tx.amount
        currentBal += change
      })

      data.push({
        date: dateStr,
        Balance: parseFloat(currentBal.toFixed(2)),
      })
    }

    return data
  }

  const balanceTrendData = getDailyBalanceData()

  // 5. Income vs Expenses for the last 4 months
  const getMonthlyCashFlowData = () => {
    const data = []
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const today = new Date()

    for (let i = 3; i >= 0; i--) {
      const targetMonth = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const mIdx = targetMonth.getMonth()
      const yIdx = targetMonth.getFullYear()

      const inc = transactions
        .filter((tx) => {
          const d = new Date(tx.date)
          return tx.type === 'INCOME' && d.getMonth() === mIdx && d.getFullYear() === yIdx
        })
        .reduce((sum, tx) => sum + tx.amount, 0)

      const exp = transactions
        .filter((tx) => {
          const d = new Date(tx.date)
          return tx.type === 'EXPENSE' && d.getMonth() === mIdx && d.getFullYear() === yIdx
        })
        .reduce((sum, tx) => sum + tx.amount, 0)

      data.push({
        month: `${monthNames[mIdx]} ${yIdx.toString().slice(-2)}`,
        Income: parseFloat(inc.toFixed(2)),
        Expenses: parseFloat(exp.toFixed(2)),
      })
    }

    return data
  }

  const cashFlowData = getMonthlyCashFlowData()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back, {user?.name || 'Guest'}</h1>
          <p className="text-muted-foreground text-sm font-light mt-0.5">Here is an overview of your financial health.</p>
        </div>
        <Link
          href="/transactions"
          className="bg-secondary hover:bg-secondary-hover text-secondary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 w-full md:w-auto shadow-md shadow-secondary/15"
        >
          <Plus className="w-4 h-4" /> Add Transaction
        </Link>
      </div>

      {/* Grid: 5 Summary Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6"
      >
        {/* Net Worth */}
        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Worth</span>
            <Wallet className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl font-bold tracking-tight">{formatCurrency(netWorth, currency)}</span>
          <span className="text-[10px] text-muted-foreground font-medium">Checking + Savings - Debt</span>
        </motion.div>

        {/* Total Balance */}
        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Assets Balance</span>
            <Wallet className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl font-bold tracking-tight">{formatCurrency(totalBalance, currency)}</span>
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
            checking & savings
          </span>
        </motion.div>

        {/* Monthly Income */}
        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">June Income</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-emerald-500">{formatCurrency(monthlyIncome, currency)}</span>
          <span className="text-[10px] text-muted-foreground font-medium">This calendar month</span>
        </motion.div>

        {/* Monthly Expenses */}
        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-colors" />
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">June Expenses</span>
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-rose-500">{formatCurrency(monthlyExpenses, currency)}</span>
          <span className="text-[10px] text-muted-foreground font-medium">This calendar month</span>
        </motion.div>

        {/* Savings Rate */}
        <motion.div variants={itemVariants} className="glass-card p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Savings Rate</span>
            <Percent className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold tracking-tight">{savingsRate}%</span>
          <span className="text-[10px] text-muted-foreground font-medium">Income saved this month</span>
        </motion.div>
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Balance Trend Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-8 glass-card p-6 rounded-2xl flex flex-col gap-4 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Balance Trend</h2>
              <p className="text-xs text-muted-foreground font-light">Running net worth assets over the past 30 days</p>
            </div>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>

          <div className="h-[280px] w-full mt-2 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceTrendData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 1000', 'dataMax + 1000']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'hsl(var(--foreground))',
                  }}
                  formatter={(value: any) => [formatCurrency(value, currency), 'Net Worth']}
                />
                <Area type="monotone" dataKey="Balance" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Spending by Category Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-4 glass-card p-6 rounded-2xl flex flex-col gap-4 text-left"
        >
          <div>
            <h2 className="text-lg font-bold text-foreground">Spending Category</h2>
            <p className="text-xs text-muted-foreground font-light">Distribution of expenses this month</p>
          </div>

          {pieData.length > 0 ? (
            <div className="flex-1 flex flex-col justify-between">
              <div className="h-[180px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: 'hsl(var(--foreground))',
                      }}
                      formatter={(value: any) => formatCurrency(value, currency)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className="flex flex-col gap-1.5 mt-2">
                {pieData.slice(0, 4).map((entry, idx) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-muted-foreground truncate max-w-[120px]">{entry.name}</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(entry.value, currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <ShoppingBag className="w-8 h-8 text-muted-foreground/40 mb-2 animate-bounce" />
              <span className="text-xs font-semibold text-muted-foreground">No expenses registered</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-6 glass-card p-6 rounded-2xl flex flex-col gap-4 text-left"
        >
          <div>
            <h2 className="text-lg font-bold text-foreground">Monthly Cash Flow</h2>
            <p className="text-xs text-muted-foreground font-light">Income vs Expenses side-by-side comparison</p>
          </div>

          <div className="h-[280px] w-full mt-2 select-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.3} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'hsl(var(--foreground))',
                  }}
                  formatter={(value: any) => formatCurrency(value, currency)}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} />
                <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-6 glass-card p-6 rounded-2xl flex flex-col gap-4 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Recent Transactions</h2>
              <p className="text-xs text-muted-foreground font-light">Latest activities registered on your accounts</p>
            </div>
            <Link href="/transactions" className="text-xs font-semibold text-secondary hover:underline flex items-center gap-0.5">
              View All <ArrowUpDown className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col divide-y divide-border/60 mt-2 flex-1">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    tx.type === 'INCOME'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  }`}>
                    {tx.merchant[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground truncate max-w-[150px] md:max-w-[200px]">{tx.merchant}</span>
                    <span className="text-[10px] text-muted-foreground font-light leading-normal">{tx.category} • {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className={`text-xs font-bold ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-foreground'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">{tx.type}</span>
                </div>
              </div>
            ))}

            {recentTransactions.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <HelpCircle className="w-8 h-8 mb-2 opacity-40 animate-bounce" />
                <span className="text-xs font-semibold">No recent transactions</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
