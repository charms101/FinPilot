'use client'

import React, { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const themeStorageKey = 'finpilot-theme'
const themeChangeEvent = 'finpilot-theme-change'

function storedTheme(): Theme {
  const savedTheme = window.localStorage.getItem(themeStorageKey)

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

function subscribeToThemeChanges(onStoreChange: () => void) {
  window.addEventListener(themeChangeEvent, onStoreChange)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', onStoreChange)

  return () => {
    window.removeEventListener(themeChangeEvent, onStoreChange)
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', onStoreChange)
  }
}

function setStoredTheme(theme: Theme) {
  window.localStorage.setItem(themeStorageKey, theme)
  window.dispatchEvent(new Event(themeChangeEvent))
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore<Theme>(subscribeToThemeChanges, storedTheme, () => 'light')

  useEffect(() => {
    const root = window.document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setStoredTheme(theme === 'dark' ? 'light' : 'dark'),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const value = useContext(ThemeContext)

  if (!value) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return value
}
