'use client'
import Image from 'next/image'
import { useState } from 'react'

interface UniversalImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  sizes?: string
}

export default function UniversalImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  fill = false,
  priority = false,
  sizes
}: UniversalImageProps) {
  const [imgSrc, setImgSrc] = useState(src?.trimEnd() || '')
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    console.log('Image failed to load:', src)
    if (!hasError) {
      setHasError(true)
      setImgSrc('https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=No+Image')
    }
  }

  if (!src) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">No Image</span>
      </div>
    )
  }

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={`object-cover ${className}`}
        onError={handleError}
        priority={priority}
        sizes={sizes}
      />
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || 250}
      height={height || 250}
      className={`object-cover ${className}`}
      onError={handleError}
      priority={priority}
      sizes={sizes}
    />
  )
}