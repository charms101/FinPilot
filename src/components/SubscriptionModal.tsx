'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SubscriptionMock } from '@/lib/mockData'

const subscriptionSchema = z.object({
  name: z.string().min(1, 'Subscription name is required'),
  monthlyCost: z.number().positive('Monthly cost must be greater than zero'),
  nextBillingDate: z.string().min(1, 'Next billing date is required'),
})

type SubscriptionFormData = z.infer<typeof subscriptionSchema>

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: SubscriptionFormData) => void
  initialData?: SubscriptionMock | null
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: SubscriptionModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: '',
      monthlyCost: 9.99,
      nextBillingDate: new Date().toISOString().split('T')[0],
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        monthlyCost: initialData.monthlyCost,
        nextBillingDate: new Date(initialData.nextBillingDate).toISOString().split('T')[0],
      })
    } else {
      reset({
        name: '',
        monthlyCost: 9.99,
        nextBillingDate: new Date().toISOString().split('T')[0],
      })
    }
  }, [initialData, reset, isOpen])

  const handleFormSubmit = (data: SubscriptionFormData) => {
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
                  {initialData ? 'Edit Subscription' : 'Add Subscription'}
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
              {/* Subscription Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sub-name" className="text-xs font-semibold text-muted-foreground">Subscription Name</label>
                <input
                  type="text"
                  id="sub-name"
                  placeholder="Netflix, Spotify, gym membership..."
                  {...register('name')}
                  className={`bg-muted border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-secondary transition-colors ${
                    errors.name ? 'border-destructive focus:border-destructive' : 'border-border'
                  }`}
                />
                {errors.name && (
                  <span className="text-[10px] text-destructive font-semibold">{errors.name.message}</span>
                )}
              </div>

              {/* Monthly Cost */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sub-cost" className="text-xs font-semibold text-muted-foreground">Monthly Cost</label>
                <input
                  type="number"
                  step="0.01"
                  id="sub-cost"
                  placeholder="9.99"
                  {...register('monthlyCost', { valueAsNumber: true })}
                  className={`bg-muted border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-secondary transition-colors ${
                    errors.monthlyCost ? 'border-destructive focus:border-destructive' : 'border-border'
                  }`}
                />
                {errors.monthlyCost && (
                  <span className="text-[10px] text-destructive font-semibold">{errors.monthlyCost.message}</span>
                )}
              </div>

              {/* Next Billing Date */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sub-date" className="text-xs font-semibold text-muted-foreground">Next Billing Date</label>
                <input
                  type="date"
                  id="sub-date"
                  {...register('nextBillingDate')}
                  className={`bg-muted border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-secondary transition-colors ${
                    errors.nextBillingDate ? 'border-destructive focus:border-destructive' : 'border-border'
                  }`}
                />
                {errors.nextBillingDate && (
                  <span className="text-[10px] text-destructive font-semibold">{errors.nextBillingDate.message}</span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-secondary hover:bg-secondary-hover text-secondary-foreground font-semibold py-3 rounded-xl transition-all duration-200 shadow-md shadow-secondary/10 mt-2 text-sm disabled:opacity-55"
              >
                {isSubmitting ? 'Saving...' : initialData ? 'Update Subscription' : 'Add Subscription'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
