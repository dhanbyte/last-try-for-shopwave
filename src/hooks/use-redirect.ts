'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function useRedirectAfterAuth() {
  const router = useRouter()
  const pathname = usePathname()

  // Save current path before redirecting to login
  const saveCurrentPath = () => {
    if (typeof window !== 'undefined') {
      // Don't save auth pages or admin pages
      const excludePaths = ['/sign-in', '/sign-up', '/register', '/admin']
      const shouldSave = !excludePaths.some(path => pathname.startsWith(path))
      
      if (shouldSave) {
        localStorage.setItem('redirectAfterAuth', pathname + window.location.search)
      }
    }
  }

  // Redirect to saved path after successful auth
  const redirectToSavedPath = () => {
    if (typeof window !== 'undefined') {
      const savedPath = localStorage.getItem('redirectAfterAuth')
      if (savedPath && savedPath !== '/') {
        localStorage.removeItem('redirectAfterAuth')
        router.push(savedPath)
        return true
      }
    }
    return false
  }

  // Redirect to login with current path saved
  const redirectToLogin = () => {
    saveCurrentPath()
    router.push('/sign-in')
  }

  return {
    saveCurrentPath,
    redirectToSavedPath,
    redirectToLogin
  }
}