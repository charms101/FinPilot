'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, User, Bell, DollarSign, Trash2, ShieldAlert, Check } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const hasHydrated = useHasHydrated()
  const router = useRouter()

  // Zustand State
  const user = useFinanceStore((state) => state.user)
  const updateUser = useFinanceStore((state) => state.updateUser)
  const currency = useFinanceStore((state) => state.currency)
  const setCurrency = useFinanceStore((state) => state.setCurrency)
  const theme = useFinanceStore((state) => state.theme)
  const setTheme = useFinanceStore((state) => state.setTheme)
  const notificationsEnabled = useFinanceStore((state) => state.notificationsEnabled)
  const setNotificationsEnabled = useFinanceStore((state) => state.setNotificationsEnabled)
  const resetAll = useFinanceStore((state) => state.resetAll)

  // Local Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user])

  if (!hasHydrated) {
    return (
      <div className="flex flex-col gap-6 animate-pulse text-left">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    )
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    updateUser(name, email)
    toast.success('Profile details updated successfully')
  }

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        '⚠️ WARNING: Are you sure you want to delete your account? This will erase all transactions, budgets, subscriptions, and goals from this browser permanently.'
      )
    ) {
      resetAll()
      toast.error('Your FinPilot account has been deleted')
      router.push('/')
    }
  }

  const currencies: ('USD' | 'EUR' | 'INR' | 'GBP')[] = ['USD', 'EUR', 'INR', 'GBP']

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-4xl text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm font-light mt-0.5">Manage preferences, currencies, notifications, and identity parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Links */}
        <div className="flex flex-col gap-2">
          <div className="bg-card border border-border/80 rounded-2xl p-4 flex flex-col gap-1 shadow-xs select-none">
            <span className="text-xs font-bold text-muted-foreground uppercase px-2 mb-2">Controls</span>
            <button className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-secondary/10 text-secondary w-full text-left">
              <User className="w-4 h-4" /> Profile Details
            </button>
          </div>
        </div>

        {/* Right Fields */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Profile Card */}
          <div className="glass-card p-6 rounded-2xl border border-border/80 shadow-xs">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-1.5 border-b border-border/40 pb-3">
              <User className="w-4 h-4 text-blue-500" /> Identity Details
            </h2>

            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="settings-name" className="text-xs font-semibold text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  id="settings-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-muted border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-secondary transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="settings-email" className="text-xs font-semibold text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  id="settings-email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-secondary transition-colors"
                />
              </div>

              <button
                type="submit"
                className="bg-secondary hover:bg-secondary-hover text-secondary-foreground font-semibold text-xs py-2.5 rounded-xl transition-all w-fit px-4"
              >
                Save Details
              </button>
            </form>
          </div>

          {/* Preferences Card */}
          <div className="glass-card p-6 rounded-2xl border border-border/80 shadow-xs">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-1.5 border-b border-border/40 pb-3">
              <Settings className="w-4 h-4 text-blue-500" /> Global Preferences
            </h2>

            <div className="flex flex-col gap-6">
              {/* Currency */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold block">Base Currency</span>
                  <span className="text-[10px] text-muted-foreground font-light block mt-0.5">Select local formatting index for cash outputs.</span>
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="bg-muted border border-border rounded-xl text-xs font-semibold px-3 py-2 outline-none"
                >
                  {currencies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between gap-4 border-t border-border/40 pt-4">
                <div>
                  <span className="text-xs font-bold block">Dark Mode Theme</span>
                  <span className="text-[10px] text-muted-foreground font-light block mt-0.5">Switch background themes.</span>
                </div>
                <div className="flex gap-1.5 bg-muted p-1 border border-border rounded-xl">
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      theme === 'light' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      theme === 'dark' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between gap-4 border-t border-border/40 pt-4">
                <div>
                  <span className="text-xs font-bold block">Budget Alerts & Updates</span>
                  <span className="text-[10px] text-muted-foreground font-light block mt-0.5">Trigger toast alerts when approaching monthly caps.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary border border-border" />
                </label>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border border-destructive/20 p-6 rounded-2xl bg-destructive/5 text-left flex flex-col gap-4">
            <h2 className="text-sm font-bold text-destructive flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Danger Zone
            </h2>
            <p className="text-[11px] text-muted-foreground font-light leading-relaxed">
              Deleting your account is irreversible. It will wipe all logs, local sessions, budgets, and goals, forcing a hard reset on this device.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold text-xs py-2.5 rounded-xl transition-all w-fit px-4 flex items-center gap-1.5 shadow-sm"
            >
              <Trash2 className="w-4 h-4" /> Delete FinPilot Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
