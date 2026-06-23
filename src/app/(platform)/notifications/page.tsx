'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, Trash2, Eye, BellOff } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { toast } from 'sonner'

export default function Notifications() {
  const hasHydrated = useHasHydrated()

  // Zustand State
  const notifications = useFinanceStore((state) => state.notifications)
  const markNotificationRead = useFinanceStore((state) => state.markNotificationRead)
  const markAllNotificationsRead = useFinanceStore((state) => state.markAllNotificationsRead)

  const handleMarkAllRead = () => {
    markAllNotificationsRead()
    toast.success('All alerts marked as read')
  }

  if (!hasHydrated) {
    return (
      <div className="flex flex-col gap-6 animate-pulse text-left">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-44 bg-muted rounded-2xl" />
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm font-light mt-0.5">Audit log of system alerts, budget alerts, and deposits.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="border border-border hover:bg-muted font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="glass-card border border-border/80 rounded-2xl overflow-hidden shadow-xs text-left max-w-3xl">
        <div className="divide-y divide-border/40 select-none">
          <AnimatePresence initial={false}>
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`flex items-start justify-between p-5 transition-all ${
                  notif.read ? 'bg-card' : 'bg-secondary/5 font-medium'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs shrink-0 ${
                    notif.read
                      ? 'bg-muted text-muted-foreground border-border'
                      : 'bg-secondary/15 text-secondary border-secondary/20'
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className={`text-sm ${notif.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground font-light">
                      {new Date(notif.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {!notif.read && (
                  <button
                    onClick={() => markNotificationRead(notif.id)}
                    className="p-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Mark as read"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {notifications.length === 0 && (
            <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
              <BellOff className="w-10 h-10 opacity-30 animate-pulse" />
              <h3 className="font-bold text-lg text-foreground">All Clear!</h3>
              <p className="text-sm text-muted-foreground max-w-xs font-light">No new alerts found. We will notify you here when transactions run near your budget limits.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
