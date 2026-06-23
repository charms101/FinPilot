import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default async function middleware(req: NextRequest) {
  const isClerkConfigured = 
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
    !!process.env.CLERK_SECRET_KEY &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('xxxxxx')

  if (isClerkConfigured) {
    try {
      // Dynamic imports allow the middleware to run without throwing errors when Clerk is not installed or configured
      const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server')
      
      const isProtectedRoute = createRouteMatcher([
        '/dashboard(.*)',
        '/transactions(.*)',
        '/budgets(.*)',
        '/goals(.*)',
        '/subscriptions(.*)',
        '/reports(.*)',
        '/notifications(.*)',
        '/insights(.*)',
        '/ai-assistant(.*)',
        '/receipt-scanner(.*)',
        '/settings(.*)',
      ])

      const clerkHandler = clerkMiddleware(async (auth, request) => {
        if (isProtectedRoute(request)) {
          await auth.protect()
        }
      })

      return clerkHandler(req as any, {} as any)
    } catch (err) {
      console.warn('Failed to load Clerk middleware, bypassing authentication guards:', err)
    }
  }

  // Fallback: allow request (client-side redirects in PlatformLayout handles guests auth)
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
