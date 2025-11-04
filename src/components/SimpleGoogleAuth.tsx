'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'

export default function SimpleGoogleAuth() {
  const { user, isLoaded } = useUser()
  const pathname = usePathname()
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    // Only show if user is not already logged in and not on auth pages
    if (!isLoaded || user) return
    
    // Don't show on auth pages
    const authPages = ['/sign-in', '/sign-up', '/register']
    if (authPages.some(page => pathname.startsWith(page))) return

    // Check if user has dismissed recently
    const dismissed = localStorage.getItem('googleAuthDismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60)
      if (hoursSinceDismissed < 24) return
    }

    // Show button after delay
    setTimeout(() => {
      setShowButton(true)
    }, 3000)

    // Auto hide after 10 seconds
    setTimeout(() => {
      setShowButton(false)
    }, 13000)
  }, [isLoaded, user, pathname])

  const handleGoogleSignIn = () => {
    // Save current path for redirect
    if (typeof window !== 'undefined') {
      const excludePaths = ['/sign-in', '/sign-up', '/register', '/admin']
      const shouldSave = !excludePaths.some(path => pathname.startsWith(path))
      
      if (shouldSave) {
        localStorage.setItem('redirectAfterAuth', pathname + window.location.search)
      }
    }
    
    // Redirect to sign-in page
    window.location.href = '/sign-in'
  }

  const handleDismiss = () => {
    localStorage.setItem('googleAuthDismissed', Date.now().toString())
    setShowButton(false)
  }

  if (!showButton) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Quick Sign In</h3>
        <button 
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      <p className="text-xs text-gray-600 mb-3">
        Sign in with Google for faster checkout and order tracking
      </p>
      
      <button
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>
    </div>
  )
}