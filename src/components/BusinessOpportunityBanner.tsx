'use client'

import { useState, useEffect } from 'react'
import { X, MessageCircle, Users } from 'lucide-react'

export default function BusinessOpportunityBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const hasSeenBanner = localStorage.getItem('hasSeenBusinessBanner')
    if (!hasSeenBanner) {
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 10000) // Show after 10 seconds
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setShowBanner(false)
    localStorage.setItem('hasSeenBusinessBanner', 'true')
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 sm:left-auto sm:right-4 sm:transform-none bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm w-[90%] sm:w-auto z-50">
      <button 
        onClick={handleClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="pr-6">
        <h3 className="font-semibold text-gray-800 mb-2 text-center sm:text-left">Business Opportunity!</h3>
        <p className="text-sm text-gray-600 mb-3 text-center sm:text-left">Join our dropshipping & wholesale program</p>
        
        <div className="space-y-2">
          <a
            href="https://wa.me/919157499884?text=Hi, I'm interested in Dropshipping business opportunity"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors"
            onClick={handleClose}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Dropshipping
          </a>
          
          <a
            href="https://wa.me/919157499884?text=Hi, I'm interested in Wholesale business opportunity"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
            onClick={handleClose}
          >
            <Users className="w-4 h-4 mr-2" />
            Wholesale
          </a>
        </div>
      </div>
    </div>
  )
}