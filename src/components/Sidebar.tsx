'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ArrowUpDown,
  Calendar,
  Target,
  Sparkles,
  FileText,
  Brain,
  Scan,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  DollarSign,
  Menu,
  X,
  CreditCard,
  User
} from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { AppUserButton } from './AuthProvider'

// Navigation links
interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<any>
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ArrowUpDown },
  { name: 'Budgets', href: '/budgets', icon: Calendar },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Insights', href: '/insights', icon: Sparkles },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Brain },
  { name: 'Receipt Scanner', href: '/receipt-scanner', icon: Scan },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const hasHydrated = useHasHydrated()
  
  // Zustand State
  const notifications = useFinanceStore((state) => state.notifications)
  const currency = useFinanceStore((state) => state.currency)
  const setCurrency = useFinanceStore((state) => state.setCurrency)
  const theme = useFinanceStore((state) => state.theme)
  const setTheme = useFinanceStore((state) => state.setTheme)

  // Local UI State
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Calculate unread notifications count
  const unreadCount = hasHydrated 
    ? notifications.filter((n) => !n.read).length 
    : 0

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const currencies: ('USD' | 'EUR' | 'INR' | 'GBP')[] = ['USD', 'EUR', 'INR', 'GBP']
  const currencySymbols: Record<string, string> = { USD: '$', EUR: '€', INR: '₹', GBP: '£' }

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value as any)
  }

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between py-4 select-none">
      <div className="flex flex-col gap-6">
        {/* Logo / Header */}
        <div className={`px-4 flex items-center justify-between ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 rounded-lg shadow-md shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                FinPilot <span className="text-xs text-blue-500 font-extrabold align-super">AI</span>
              </span>
            )}
          </div>
          
          {/* Collapse Button (Desktop only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const isNotifications = item.name === 'Notifications'
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-secondary/10 border border-secondary/20 text-secondary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-secondary' : 'group-hover:text-foreground'}`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
                
                {/* Notification Badge */}
                {isNotifications && unreadCount > 0 && (
                  <span className={`absolute flex items-center justify-center text-[10px] font-extrabold rounded-full bg-destructive text-destructive-foreground ${
                    isCollapsed ? 'top-1.5 right-1.5 w-4 h-4' : 'right-3 px-1.5 py-0.5'
                  }`}>
                    {unreadCount}
                  </span>
                )}

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-14 scale-0 group-hover:scale-100 bg-slate-950 text-white text-xs px-2.5 py-1.5 rounded-md border border-slate-800 transition-all origin-left shadow-xl pointer-events-none z-50 whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-4 px-3 border-t border-border/60 pt-4">
        {/* Currency & Theme Toggles */}
        {!isCollapsed ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
              <span>Currency</span>
              <span>Theme</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={currency}
                onChange={handleCurrencyChange}
                className="bg-muted border border-border rounded-lg text-xs font-medium px-2 py-1.5 outline-none flex-1"
              >
                {currencies.map(c => (
                  <option key={c} value={c}>
                    {c} ({currencySymbols[c]})
                  </option>
                ))}
              </select>
              <button
                onClick={toggleTheme}
                className="bg-muted border border-border p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={toggleTheme}
              className="bg-muted border border-border p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <span className="text-[10px] font-bold text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded-md">
              {currencySymbols[currency] || '$'}
            </span>
          </div>
        )}

        {/* User profile section */}
        <div className={`flex items-center border border-border/40 p-2 rounded-2xl bg-muted/20 ${isCollapsed ? 'justify-center' : ''}`}>
          <AppUserButton />
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar (Fixed side panel) */}
      <aside className={`hidden md:flex flex-col border-r border-border/80 bg-card h-screen sticky top-0 transition-all duration-300 z-30 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        <SidebarContent />
      </aside>

      {/* Mobile Header Bar */}
      <header className="md:hidden flex items-center justify-between px-6 h-16 border-b border-border bg-card sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 rounded-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm">FinPilot AI</span>
        </div>

        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Drawer (Overlay) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            {/* Slider Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 bg-card h-full border-r border-border z-10"
            >
              {/* Close Button inside drawer */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="h-full pt-4">
                <SidebarContent />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
