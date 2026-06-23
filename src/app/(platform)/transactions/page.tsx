'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  SlidersHorizontal,
  Calendar,
  X
} from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import TransactionModal from '@/components/TransactionModal'
import { TransactionMock } from '@/lib/mockData'

const ITEMS_PER_PAGE = 10

export default function Transactions() {
  const hasHydrated = useHasHydrated()
  
  // Zustand store actions
  const transactions = useFinanceStore((state) => state.transactions)
  const addTransaction = useFinanceStore((state) => state.addTransaction)
  const updateTransaction = useFinanceStore((state) => state.updateTransaction)
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction)
  const currency = useFinanceStore((state) => state.currency)

  // Modals & form state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<TransactionMock | null>(null)

  // Filters State
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('All') // All, 7days, 30days, currentMonth
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [showAdvanceFilters, setShowAdvanceFilters] = useState(false)

  // Sorting State
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'merchant'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)

  if (!hasHydrated) {
    return (
      <div className="flex flex-col gap-6 animate-pulse text-left">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-12 bg-muted rounded-xl" />
        <div className="h-[400px] bg-muted rounded-2xl" />
      </div>
    )
  }

  // 1. Filter Transactions
  const filteredTransactions = transactions
    .filter((tx) => {
      // Search term
      const matchesSearch =
        tx.merchant.toLowerCase().includes(search.toLowerCase()) ||
        (tx.description && tx.description.toLowerCase().includes(search.toLowerCase()))
      
      // Category filter
      const matchesCategory = categoryFilter === 'All' || tx.category === categoryFilter

      // Type filter
      const matchesType = typeFilter === 'All' || tx.type === typeFilter

      // Date range filter
      let matchesDate = true
      const txDate = new Date(tx.date)
      const now = new Date()
      if (dateFilter === '7days') {
        const diff = Math.abs(now.getTime() - txDate.getTime())
        matchesDate = Math.ceil(diff / (1000 * 60 * 60 * 24)) <= 7
      } else if (dateFilter === '30days') {
        const diff = Math.abs(now.getTime() - txDate.getTime())
        matchesDate = Math.ceil(diff / (1000 * 60 * 60 * 24)) <= 30
      } else if (dateFilter === 'currentMonth') {
        matchesDate = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
      }

      // Amount filter
      const matchesMinAmount = minAmount === '' || tx.amount >= parseFloat(minAmount)
      const matchesMaxAmount = maxAmount === '' || tx.amount <= parseFloat(maxAmount)

      return matchesSearch && matchesCategory && matchesType && matchesDate && matchesMinAmount && matchesMaxAmount
    })
    // 2. Sort Transactions
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount
      } else if (sortBy === 'merchant') {
        comparison = a.merchant.localeCompare(b.merchant)
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

  // 3. Paginate Transactions
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const toggleSort = (field: 'date' | 'amount' | 'merchant') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setCurrentPage(1)
  }

  // CRUD Actions
  const handleOpenAddModal = () => {
    setEditingTx(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (tx: TransactionMock) => {
    setEditingTx(tx)
    setIsModalOpen(true)
  }

  const handleFormSubmit = (data: any) => {
    if (editingTx) {
      // Edit mode
      updateTransaction({
        ...editingTx,
        ...data,
        date: new Date(data.date).toISOString(),
      })
      toast.success('Transaction updated successfully')
    } else {
      // Add mode
      addTransaction({
        ...data,
        date: new Date(data.date).toISOString(),
      })
      toast.success('Transaction added successfully')
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id)
      toast.error('Transaction deleted')
    }
  }

  const resetFilters = () => {
    setSearch('')
    setCategoryFilter('All')
    setTypeFilter('All')
    setDateFilter('All')
    setMinAmount('')
    setMaxAmount('')
    setCurrentPage(1)
  }

  const CATEGORIES = ['Food', 'Shopping', 'Transportation', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other']

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground text-sm font-light mt-0.5">Manage and filter your transaction ledger.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-secondary hover:bg-secondary-hover text-secondary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-secondary/15"
        >
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      {/* Search & Basic Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search by merchant or notes..."
              className="bg-muted border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm w-full outline-none focus:border-secondary transition-colors"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-muted border border-border rounded-xl text-xs font-semibold px-3 py-2.5 outline-none hover:border-border/85"
            >
              <option value="All">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-muted border border-border rounded-xl text-xs font-semibold px-3 py-2.5 outline-none hover:border-border/85"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <button
              onClick={() => setShowAdvanceFilters(!showAdvanceFilters)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-xl border transition-all ${
                showAdvanceFilters
                  ? 'bg-secondary/10 border-secondary/20 text-secondary'
                  : 'bg-muted border-border hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            </button>

            {(search || typeFilter !== 'All' || categoryFilter !== 'All' || dateFilter !== 'All' || minAmount || maxAmount) && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-destructive hover:underline px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Advanced Filters */}
        <AnimatePresence>
          {showAdvanceFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card border border-border/80 rounded-2xl p-5 flex flex-col md:flex-row gap-6 items-end text-left shadow-xs">
                {/* Date Filter */}
                <div className="flex flex-col gap-1.5 w-full md:w-1/3">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Date Range
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="bg-muted border border-border rounded-xl text-xs font-semibold px-3 py-2.5 outline-none"
                  >
                    <option value="All">All Time</option>
                    <option value="7days">Past 7 Days</option>
                    <option value="30days">Past 30 Days</option>
                    <option value="currentMonth">Current Month</option>
                  </select>
                </div>

                {/* Min Amount */}
                <div className="flex flex-col gap-1.5 w-full md:w-1/3">
                  <label className="text-xs font-semibold text-muted-foreground">Min Amount</label>
                  <input
                    type="number"
                    value={minAmount}
                    onChange={(e) => {
                      setMinAmount(e.target.value)
                      setCurrentPage(1)
                    }}
                    placeholder="0.00"
                    className="bg-muted border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-secondary"
                  />
                </div>

                {/* Max Amount */}
                <div className="flex flex-col gap-1.5 w-full md:w-1/3">
                  <label className="text-xs font-semibold text-muted-foreground">Max Amount</label>
                  <input
                    type="number"
                    value={maxAmount}
                    onChange={(e) => {
                      setMaxAmount(e.target.value)
                      setCurrentPage(1)
                    }}
                    placeholder="10000.00"
                    className="bg-muted border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-secondary"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transaction Table */}
      <div className="glass-card rounded-2xl border border-border/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto select-none">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-xs font-semibold text-muted-foreground">
                <th
                  onClick={() => toggleSort('merchant')}
                  className="py-4 px-6 cursor-pointer hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-center gap-1">Merchant {sortBy === 'merchant' && <ArrowUpDown className="w-3 h-3 text-secondary" />}</div>
                </th>
                <th className="py-4 px-6">Category</th>
                <th
                  onClick={() => toggleSort('amount')}
                  className="py-4 px-6 cursor-pointer hover:bg-muted/10 transition-colors text-right"
                >
                  <div className="flex items-center gap-1 justify-end">Amount {sortBy === 'amount' && <ArrowUpDown className="w-3 h-3 text-secondary" />}</div>
                </th>
                <th
                  onClick={() => toggleSort('date')}
                  className="py-4 px-6 cursor-pointer hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-center gap-1">Date {sortBy === 'date' && <ArrowUpDown className="w-3 h-3 text-secondary" />}</div>
                </th>
                <th className="py-4 px-6 text-center">Type</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-sm">
              {paginatedTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/10 transition-colors">
                  {/* Merchant & Desc */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground truncate max-w-[150px] md:max-w-[200px]">{tx.merchant}</span>
                      {tx.description && (
                        <span className="text-[10px] text-muted-foreground font-light leading-normal">{tx.description}</span>
                      )}
                    </div>
                  </td>
                  {/* Category */}
                  <td className="py-4 px-6">
                    <span className="bg-muted border border-border px-2.5 py-1 rounded-lg text-xs font-medium">
                      {tx.category}
                    </span>
                  </td>
                  {/* Amount */}
                  <td className="py-4 px-6 text-right">
                    <span className={`font-bold ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-foreground'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </span>
                  </td>
                  {/* Date */}
                  <td className="py-4 px-6 font-medium text-muted-foreground text-xs">
                    {new Date(tx.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  {/* Type */}
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      tx.type === 'INCOME'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    }`}>
                      {tx.type === 'INCOME' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      {tx.type}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(tx)}
                        className="p-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 border border-border rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted-foreground font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <HelpCircle className="w-8 h-8 opacity-40 animate-bounce" />
                      <span>No transactions found matching the filters</span>
                      <button onClick={resetFilters} className="text-xs font-bold text-secondary underline mt-1">Reset Filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/60 bg-muted/10 px-6 py-4">
            <span className="text-xs font-medium text-muted-foreground">
              Showing page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CRUD Modal Form */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingTx}
      />
    </div>
  )
}
