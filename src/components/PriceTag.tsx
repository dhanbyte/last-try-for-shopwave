export default function PriceTag({ original, discounted, currency = '₹', size = 'md' }: { original: number; discounted?: number; currency?: string; size?: 'sm' | 'md' | 'lg' }) {
  const safeOriginal = original || 0
  const safeDiscounted = discounted || 0
  const price = safeDiscounted || safeOriginal
  const off = safeDiscounted ? Math.round(((safeOriginal - safeDiscounted) / safeOriginal) * 100) : 0
  const savings = safeDiscounted ? safeOriginal - safeDiscounted : 0;

  const sizeClasses = {
    sm: {
      price: 'text-sm font-bold text-gray-900',
      original: 'text-xs text-gray-400 line-through',
      discount: 'text-[9px] md:text-xs font-medium text-green-600 bg-green-50 px-0.5 md:px-1 rounded'
    },
    md: {
      price: 'text-lg font-bold text-gray-900',
      original: 'text-sm text-gray-400 line-through',
      discount: 'text-[9px] md:text-xs font-medium text-green-600 bg-green-50 px-0.5 md:px-1 rounded'
    },
    lg: {
      price: 'text-xl font-semibold',
      original: 'text-base text-gray-400 line-through',
      discount: 'text-xs md:text-sm font-medium text-green-600'
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-2">
        <span className={sizeClasses[size].price}>{currency}{price.toLocaleString('en-IN')}</span>
        {safeDiscounted && (
          <span className={sizeClasses[size].original}>{currency}{safeOriginal.toLocaleString('en-IN')}</span>
        )}
      </div>
      {safeDiscounted && (
        <span className={sizeClasses[size].discount}>
          {off}% off • Save {currency}{savings.toLocaleString('en-IN')}
        </span>
      )}
    </div>
  )
}
