'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { BudgetMock } from '@/lib/mockData'

const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  limit: z.number().positive('Limit must be greater than zero'),
})

type BudgetFormData = z.infer<typeof budgetSchema>

interface BudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: BudgetFormData) => void
  initialData?: BudgetMock | null
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

export default function BudgetModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: BudgetModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: 'Food',
      limit: 100,
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        category: initialData.category,
        limit: initialData.limit,
      })
    } else {
      reset({
        category: 'Food',
        limit: 100,
      })
    }
  }, [initialData, reset, isOpen])

  const handleFormSubmit = (data: BudgetFormData) => {
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
                  {initialData ? 'Edit Budget' : 'Create Budget'}
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

              {/* Limit */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="limit" className="text-xs font-semibold text-muted-foreground">Monthly Limit</label>
                <input
                  type="number"
                  id="limit"
                  placeholder="0.00"
                  {...register('limit', { valueAsNumber: true })}
                  className={`bg-muted border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-secondary transition-colors ${
                    errors.limit ? 'border-destructive focus:border-destructive' : 'border-border'
                  }`}
                />
                {errors.limit && (
                  <span className="text-[10px] text-destructive font-semibold">{errors.limit.message}</span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-secondary hover:bg-secondary-hover text-secondary-foreground font-semibold py-3 rounded-xl transition-all duration-200 shadow-md shadow-secondary/10 mt-2 text-sm disabled:opacity-55"
              >
                {isSubmitting ? 'Saving...' : initialData ? 'Update Budget' : 'Create Budget'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
