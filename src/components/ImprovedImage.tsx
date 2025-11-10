'use client'
import Image from 'next/image'
import { useState } from 'react'

interface ImprovedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  sizes?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
}

export default function ImprovedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  fill = false,
  priority = false,
  sizes,
  objectFit = 'cover'
}: ImprovedImageProps) {
  const [imgSrc, setImgSrc] = useState(src?.trimEnd() || '')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    setImgSrc('https://via.placeholder.com/250x250/f3f4f6/9ca3af?text=No+Image')
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  const objectFitClass = `object-${objectFit}`

  if (fill) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={imgSrc}
          alt={alt}
          fill
          className={`${objectFitClass} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onError={handleError}
          onLoad={handleLoad}
          priority={priority}
          sizes={sizes}
          unoptimized={true}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400 text-sm">Loading...</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={imgSrc}
        alt={alt}
        width={width || 250}
        height={height || 250}
        className={`${objectFitClass} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        sizes={sizes}
        unoptimized={true}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
    </div>
  )
}