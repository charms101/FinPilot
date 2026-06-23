'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useAppAuth } from '@/components/AuthProvider'

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAppAuth()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground gap-4 font-sans select-none">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">Initializing FinPilot...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main viewport */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative p-6 md:p-8 bg-background">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-6 md:gap-8 pb-12">
          {children}
        </div>
      </main>
    </div>
  )
}
