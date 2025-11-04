'use client'

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-2 flex flex-col animate-pulse">
      <div className="w-full aspect-square mb-3 sm:mb-2 bg-gray-200 rounded-md"></div>
      <div className="flex-1 flex flex-col">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
        <div className="h-8 bg-gray-200 rounded mt-auto"></div>
      </div>
    </div>
  )
}