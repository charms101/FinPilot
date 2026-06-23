'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { ClerkProvider, Show, UserButton, useUser as useClerkUser, useAuth as useClerkAuth } from '@clerk/nextjs'
import { useFinanceStore } from '../store/financeStore'

// Check if Clerk publishable key is defined and not a placeholder
export const isClerkConfigured = 
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('xxxxxx')

interface MockUser {
  id: string
  fullName: string | null
  imageUrl: string
  primaryEmailAddress: {
    emailAddress: string
  } | null
}

interface AuthContextType {
  isSignedIn: boolean
  isLoaded: boolean
  userId: string | null
  user: MockUser | null
  signOut: () => void
  signIn: (email: string, name: string) => void
}

const AuthContext = createContext<AuthContextType>({
  isSignedIn: false,
  isLoaded: false,
  userId: null,
  user: null,
  signOut: () => {},
  signIn: () => {},
})

export const useMockAuth = () => useContext(AuthContext)

// Mock Auth Provider for when Clerk is not configured
function LocalAuthProvider({ children }: { children: React.ReactNode }) {
  const storeUser = useFinanceStore((state) => state.user)
  const resetAll = useFinanceStore((state) => state.resetAll)
  const initializeDemo = useFinanceStore((state) => state.initializeDemo)

  const [user, setUser] = useState<MockUser | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (storeUser) {
      setUser({
        id: storeUser.id,
        fullName: storeUser.name,
        imageUrl: storeUser.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256',
        primaryEmailAddress: {
          emailAddress: storeUser.email,
        },
      })
    } else {
      setUser(null)
    }
    setIsLoaded(true)
  }, [storeUser])

  const signIn = (email: string, name: string) => {
    const newUser = {
      id: 'user_' + Date.now(),
      name,
      email,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256',
      createdAt: new Date().toISOString(),
    }
    // Update store
    useFinanceStore.setState({ user: newUser })
    // Seed default data for the new user if they have no transactions
    initializeDemo()
  }

  const signOut = () => {
    resetAll()
    setUser(null)
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  const value: AuthContextType = {
    isSignedIn: !!user,
    isLoaded,
    userId: user?.id || null,
    user,
    signOut,
    signIn,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Unified Auth Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (isClerkConfigured) {
    return (
      <ClerkProvider>
        {children}
      </ClerkProvider>
    )
  }

  return <LocalAuthProvider>{children}</LocalAuthProvider>
}

// Unified custom hooks
export function useAppAuth() {
  const clerkAuth = isClerkConfigured ? useClerkAuth() : null
  const mockAuth = useMockAuth()

  if (isClerkConfigured && clerkAuth) {
    return {
      isSignedIn: !!clerkAuth.isSignedIn,
      isLoaded: clerkAuth.isLoaded,
      userId: clerkAuth.userId,
      signOut: clerkAuth.signOut,
    }
  }

  return {
    isSignedIn: mockAuth.isSignedIn,
    isLoaded: mockAuth.isLoaded,
    userId: mockAuth.userId,
    signOut: mockAuth.signOut,
  }
}

export function useAppUser() {
  const clerkUser = isClerkConfigured ? useClerkUser() : null
  const mockAuth = useMockAuth()

  if (isClerkConfigured && clerkUser) {
    return {
      isSignedIn: !!clerkUser.isSignedIn,
      isLoaded: clerkUser.isLoaded,
      user: clerkUser.user ? {
        id: clerkUser.user.id,
        fullName: clerkUser.user.fullName,
        imageUrl: clerkUser.user.imageUrl,
        primaryEmail: clerkUser.user.primaryEmailAddress?.emailAddress || '',
      } : null,
    }
  }

  return {
    isSignedIn: mockAuth.isSignedIn,
    isLoaded: mockAuth.isLoaded,
    user: mockAuth.user ? {
      id: mockAuth.user.id,
      fullName: mockAuth.user.fullName,
      imageUrl: mockAuth.user.imageUrl,
      primaryEmail: mockAuth.user.primaryEmailAddress?.emailAddress || '',
    } : null,
  }
}

// Unified UI Components wrapper
export function SignedInWrapper({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAppAuth()

  if (!isLoaded) return null

  if (isClerkConfigured) {
    return <Show when="signed-in">{children}</Show>
  }

  return isSignedIn ? <>{children}</> : null
}

export function SignedOutWrapper({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAppAuth()

  if (!isLoaded) return null

  if (isClerkConfigured) {
    return <Show when="signed-out">{children}</Show>
  }

  return !isSignedIn ? <>{children}</> : null
}

export function AppUserButton() {
  const { user } = useAppUser()
  const { signOut: authSignOut } = useAppAuth()

  if (isClerkConfigured) {
    return <UserButton />
  }

  if (!user) return null

  return (
    <div className="flex items-center gap-3">
      <img
        src={user.imageUrl}
        alt={user.fullName || 'User'}
        className="w-8 h-8 rounded-full ring-2 ring-secondary/50 cursor-pointer object-cover"
        title={user.fullName || 'User Profile'}
      />
      <div className="hidden md:block text-left">
        <p className="text-xs font-semibold text-foreground/90 truncate max-w-[100px]">
          {user.fullName || 'FinPilot Guest'}
        </p>
        <button
          onClick={() => authSignOut()}
          className="text-[10px] text-muted-foreground hover:text-destructive transition-colors block text-left"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
