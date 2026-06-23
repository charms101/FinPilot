'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GoalMock } from '@/lib/mockData'

const goalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  targetAmount: z.number().positive('Target amount must be greater than zero'),
  deadline: z.string().min(1, 'Deadline is required'),
})

type GoalFormData = z.infer<typeof goalSchema>

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: GoalFormData) => void
  initialData?: GoalMock | null
}

export default function GoalModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: GoalModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      targetAmount: 1000,
      deadline: new Date(Date.now() + 1000*60*60*24*365).toISOString().split('T')[0], // 1 year from now
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        targetAmount: initialData.targetAmount,
        deadline: new Date(initialData.deadline).toISOString().split('T')[0],
      })
    } else {
      reset({
        name: '',
        targetAmount: 1000,
        deadline: new Date(Date.now() + 1000*60*60*24*365).toISOString().split('T')[0],
      })
    }
  }, [initialData, reset, isOpen])

  const handleFormSubmit = (data: GoalFormData) => {
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
                  {initialData ? 'Edit Goal' : 'Create Goal'}
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
              {/* Goal Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-xs font-semibold text-muted-foreground">Goal Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Emergency Fund, Japan Trip, New Laptop..."
                  {...register('name')}
                  className={`bg-muted border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-secondary transition-colors ${
                    errors.name ? 'border-destructive focus:border-destructive' : 'border-border'
                  }`}
                />
                {errors.name && (
                  <span className="text-[10px] text-destructive font-semibold">{errors.name.message}</span>
                )}
              </div>

              {/* Target Amount */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="targetAmount" className="text-xs font-semibold text-muted-foreground">Target Amount</label>
                <input
                  type="number"
                  id="targetAmount"
                  placeholder="0.00"
                  {...register('targetAmount', { valueAsNumber: true })}
                  className={`bg-muted border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-secondary transition-colors ${
                    errors.targetAmount ? 'border-destructive focus:border-destructive' : 'border-border'
                  }`}
                />
                {errors.targetAmount && (
                  <span className="text-[10px] text-destructive font-semibold">{errors.targetAmount.message}</span>
                )}
              </div>

              {/* Deadline */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="deadline" className="text-xs font-semibold text-muted-foreground">Target Deadline</label>
                <input
                  type="date"
                  id="deadline"
                  {...register('deadline')}
                  className={`bg-muted border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-secondary transition-colors ${
                    errors.deadline ? 'border-destructive focus:border-destructive' : 'border-border'
                  }`}
                />
                {errors.deadline && (
                  <span className="text-[10px] text-destructive font-semibold">{errors.deadline.message}</span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-secondary hover:bg-secondary-hover text-secondary-foreground font-semibold py-3 rounded-xl transition-all duration-200 shadow-md shadow-secondary/10 mt-2 text-sm disabled:opacity-55"
              >
                {isSubmitting ? 'Saving...' : initialData ? 'Update Goal' : 'Create Goal'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
