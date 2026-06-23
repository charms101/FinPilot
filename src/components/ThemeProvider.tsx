'use client'

import React, { useEffect } from 'react'
import { useFinanceStore } from '../store/financeStore'
import { useHasHydrated } from '../hooks/useHasHydrated'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useFinanceStore((state) => state.theme)
  const hasHydrated = useHasHydrated()

  useEffect(() => {
    if (!hasHydrated) return

    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
  }, [theme, hasHydrated])

  // Prevent flash by matching document class if hydrated, or fall back to SSR dark
  return <>{children}</>
}
