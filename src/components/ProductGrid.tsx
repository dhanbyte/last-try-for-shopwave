
import ProductCard from './ProductCard'
import type { Product } from '@/lib/types'
import { useState, useEffect, useRef, useCallback } from 'react'

interface ProductGridProps {
  products: Product[]
  initialCount?: number
  loadMoreCount?: number
}

export default function ProductGrid({ products, initialCount = 20, loadMoreCount = 10 }: ProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)
  const loadMoreProducts = useCallback(() => {
    if (isLoadingMore || visibleCount >= products.length) return
    
    setIsLoadingMore(true)
    
    setTimeout(() => {
      setVisibleCount(prev => prev + loadMoreCount)
      setIsLoadingMore(false)
    }, 300)
  }, [isLoadingMore, visibleCount, products.length, loadMoreCount])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < products.length) {
          loadMoreProducts()
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current)
      }
    }
  }, [loadMoreProducts, visibleCount, products.length])

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10 rounded-xl border bg-white">
        <p className="text-gray-600">No products found.</p>
        <p className="text-sm text-gray-500">Please try adjusting your search or filters.</p>
      </div>
    )
  }

  const visibleProducts = products.slice(0, visibleCount)

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {visibleProducts.map(p => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
      
      {/* Infinite Scroll Trigger */}
      {visibleCount < products.length && (
        <div ref={observerRef} className="text-center mt-6 py-4">
          {isLoadingMore && (
            <div className="flex justify-center items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand"></div>
              <span className="text-sm text-gray-600">Loading more...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
