'use client'
import { useEffect } from 'react'

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Add cache busting for vendor pages
    const handleBeforeUnload = () => {
      // Clear vendor cache when leaving vendor pages
      const currentPath = window.location.pathname
      if (!currentPath.startsWith('/vendor/')) {
        localStorage.removeItem('vendorCache')
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return <>{children}</>
}