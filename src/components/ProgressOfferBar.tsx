'use client'
import { useCart } from '@/lib/cartStore'
import { getGiftTier } from '@/lib/data/gifts'

export default function ProgressOfferBar() {
  const { subtotal, totalDiscount } = useCart()
  const itemTotal = subtotal - totalDiscount
  
  const freeDeliveryThreshold = 399
  const giftTiers = [399, 699, 999]
  
  const currentTier = getGiftTier(itemTotal)
  const nextTier = giftTiers.find(tier => tier > itemTotal) || 999
  
  const progress = Math.min((itemTotal / nextTier) * 100, 100)
  const remaining = Math.max(nextTier - itemTotal, 0)
  
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200 mb-4">
      {/* Progress Bar with Labels */}
      <div className="relative">
        {/* Progress Bar */}
        <div className="relative bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Mobile Optimized Layout */}
        <div className="space-y-2">
          {/* Tier Markers Row */}
          <div className="flex justify-between items-center px-1">
            <div className="text-center">
              <div className={`text-lg ${itemTotal >= 399 ? 'text-green-600' : 'text-gray-400'}`}>🚚</div>
              <div className="text-xs font-medium">₹399</div>
            </div>
            <div className="text-center">
              <div className={`text-lg ${itemTotal >= 699 ? 'text-green-600' : 'text-gray-400'}`}>🎁</div>
              <div className="text-xs font-medium">₹699</div>
            </div>
            <div className="text-center">
              <div className={`text-lg ${itemTotal >= 999 ? 'text-green-600' : 'text-gray-400'}`}>🎁🎁🎁</div>
              <div className="text-xs font-medium">₹999</div>
            </div>
          </div>
          
          {/* Benefits Labels Row */}
          <div className="flex justify-between text-xs px-1">
            <div className={`text-center max-w-[30%] ${itemTotal >= 399 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
              Free Delivery
            </div>
            <div className={`text-center max-w-[30%] ${itemTotal >= 699 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
              2 Free Gifts
            </div>
            <div className={`text-center max-w-[30%] ${itemTotal >= 999 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
              3 Free Gifts
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Text */}
      <div className="text-center">
        {itemTotal >= 999 ? (
          <div className="text-green-600 font-bold text-sm">
            🎉 Congratulations! Free Delivery + 3 Free Gifts Unlocked!
          </div>
        ) : itemTotal >= 699 ? (
          <div className="text-blue-600 font-medium text-sm">
            🎁 Free Delivery + 2 Gifts Unlocked! Add ₹{999 - itemTotal} for 3rd Gift
          </div>
        ) : itemTotal >= 399 ? (
          <div className="text-green-600 font-medium text-sm">
            🚚 Free Delivery + 1 Gift Unlocked! Add ₹{699 - itemTotal} for 2nd Gift
          </div>
        ) : (
          <div className="text-orange-600 font-medium text-sm">
            Add ₹{399 - itemTotal} more for Free Delivery + Free Gifts!
          </div>
        )}
      </div>
    </div>
  )
}