'use client'

export default function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">ShopWave</h2>
        <p className="text-gray-600">Loading your shopping experience...</p>
      </div>
    </div>
  )
}
