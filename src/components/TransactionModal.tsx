'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { TransactionMock } from '@/lib/mockData'

const transactionSchema = z.object({
  merchant: z.string().min(1, 'Merchant is required'),
  description: z.string().optional(),
  amount: z.number().positive('Amount must be greater than zero'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['INCOME', 'EXPENSE']),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TransactionFormData) => void
  initialData?: TransactionMock | null
}

const CATEGORIES = [
  'Food',
  'Shopping',
  'Transportation',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Education',
  'Other',
]

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: TransactionModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      merchant: '',
      description: '',
      amount: 0,
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      type: 'EXPENSE',
    },
  })

  const transactionType = watch('type')

  // Prefill when editing
  useEffect(() => {
    if (initialData) {
      reset({
        merchant: initialData.merchant,
        description: initialData.description || '',
        amount: initialData.amount,
        category: initialData.category,
        date: new Date(initialData.date).toISOString().split('T')[0],
        type: initialData.type,
      })
    } else {
      reset({
        merchant: '',
        description: '',
        amount: 0,
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        type: 'EXPENSE',
      })
    }
  }, [initialData, reset, isOpen])

  const handleFormSubmit = (data: TransactionFormData) => {
    onSubmit(data)
    reset()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl z-10 text-left"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-secondary/10 p-2 rounded-xl border border-secondary/20 text-secondary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {initialData ? 'Edit Transaction' : 'Add Transaction'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
              {/* Type Toggle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setValue('type', 'EXPENSE')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      errors.type?.message ? 'border-destructive' : ''
                    } ${
                      transactionType === 'EXPENSE'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('type', 'INCOME')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      errors.type?.message ? 'border-destructive' : ''
                    } ${
                      transactionType === 'INCOME'
                        ? 'bg-card text-emerald-500 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Merchant */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="merchant" className="text-xs font-semibold text-muted-foreground">Merchant / Source</label>
                <input
                  type="text"
                  id="merchant"
                  placeholder="Starbucks, Paycheck, Whole Foods..."
                  {...register('merchant')}
                  className={`bg-muted border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-secondary transition-colors ${
                    errors.merchant ? 'border-destructive focus:border-destructive' : 'border-border'
                  }`}
                />
                {errors.merchant && (
                  <span className="text-[10px] text-destructive font-semibold">{errors.merchant.message}</span>
                )}
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="amount" className="text-xs font-semibold text-muted-foreground">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    id="amount"
                    placeholder="0.00"
                    {...register('amount', { valueAsNumber: true })}
                    className={`bg-muted border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-secondary transition-colors ${
                      errors.amount ? 'border-destructive focus:border-destructive' : 'border-border'
                    }`}
                  />
                  {errors.amount && (
                    <span className="text-[10px] text-destructive font-semibold">{errors.amount.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="date" className="text-xs font-semibold text-muted-foreground">Date</label>
                  <input
                    type="date"
                    id="date"
                    {...register('date')}
                    className={`bg-muted border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-secondary transition-colors ${
                      errors.date ? 'border-destructive focus:border-destructive' : 'border-border'
                    }`}
                  />
                  {errors.date && (
                    <span className="text-[10px] text-destructive font-semibold">{errors.date.message}</span>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="category" className="text-xs font-semibold text-muted-foreground">Category</label>
                <select
                  id="category"
                  {...register('category')}
                  className="bg-muted border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-secondary transition-colors"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="text-[10px] text-destructive font-semibold">{errors.category.message}</span>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className="text-xs font-semibold text-muted-foreground">Description (Optional)</label>
                <input
                  type="text"
                  id="description"
                  placeholder="Notes..."
                  {...register('description')}
                  className="bg-muted border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-secondary transition-colors"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-secondary hover:bg-secondary-hover text-secondary-foreground font-semibold py-3 rounded-xl transition-all duration-200 shadow-md shadow-secondary/10 mt-2 text-sm disabled:opacity-55"
              >
                {isSubmitting ? 'Saving...' : initialData ? 'Update Transaction' : 'Add Transaction'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
