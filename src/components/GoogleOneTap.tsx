'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    google: any
  }
}

export default function GoogleOneTap() {
  const { user, isLoaded } = useUser()
  const pathname = usePathname()
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    // Only show if user is not already logged in and not on auth pages
    if (!isLoaded || user || hasShown) return
    
    // Don't show on auth pages
    const authPages = ['/sign-in', '/sign-up', '/register']
    if (authPages.some(page => pathname.startsWith(page))) return

    // Check if user has dismissed One Tap recently
    const dismissed = localStorage.getItem('googleOneTapDismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60)
      if (hoursSinceDismissed < 24) return // Don't show for 24 hours after dismissal
    }

    // Check if script already exists
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      initializeGoogleOneTap()
      return
    }

    // Load Google One Tap script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initializeGoogleOneTap
    script.onerror = () => console.warn('Failed to load Google One Tap script')
    document.head.appendChild(script)

    return () => {
      // Don't remove script as it might be used by other components
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.cancel()
        } catch (error) {
          // Ignore cancellation errors
        }
      }
    }
  }, [isLoaded, user, pathname, hasShown])

  const initializeGoogleOneTap = () => {
    if (!window.google?.accounts?.id) {
      setTimeout(initializeGoogleOneTap, 100)
      return
    }

    try {
      window.google.accounts.id.initialize({
        client_id: '598906497945-hpnk38kbgk1qtdlo8novf6faaurcckn2.apps.googleusercontent.com',
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        itp_support: true,
        use_fedcm_for_prompt: false // Disable FedCM to avoid the error
      })

      // Show One Tap prompt after a delay
      setTimeout(() => {
        if (!hasShown && window.google?.accounts?.id) {
          try {
            window.google.accounts.id.prompt((notification: any) => {
              if (notification.isNotDisplayed()) {
                console.log('One Tap not displayed:', notification.getNotDisplayedReason())
              } else if (notification.isSkippedMoment()) {
                localStorage.setItem('googleOneTapDismissed', Date.now().toString())
              } else if (notification.isDismissedMoment()) {
                localStorage.setItem('googleOneTapDismissed', Date.now().toString())
              }
            })
            setHasShown(true)
          } catch (error) {
            console.warn('Google One Tap prompt error:', error)
          }
        }
      }, 3000) // Increased delay to 3 seconds
    } catch (error) {
      console.warn('Google One Tap initialization error:', error)
    }
  }

  const handleCredentialResponse = async (response: any) => {
    try {
      // Save current path for redirect after login
      if (typeof window !== 'undefined') {
        const excludePaths = ['/sign-in', '/sign-up', '/register', '/admin']
        const shouldSave = !excludePaths.some(path => pathname.startsWith(path))
        
        if (shouldSave) {
          localStorage.setItem('redirectAfterAuth', pathname + window.location.search)
        }
      }
      
      // Redirect to Clerk's Google OAuth
      window.location.href = '/sign-in#/factor-one'
    } catch (error) {
      console.error('Google Sign-in error:', error)
    }
  }

  return null // Component doesn't render anything visible
}