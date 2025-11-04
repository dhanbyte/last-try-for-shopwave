'use client'
import { useCart } from '@/lib/cartStore'

export default function SmartOfferBanner() {
  const { deliveryInfo } = useCart()
  const { giftTier, isFreeDelivery } = deliveryInfo

  return (
    <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-lg mb-4">
      <div className="flex items-center justify-between">
        <div>
          {isFreeDelivery ? (
            <p className="text-sm font-medium">🎉 Free Delivery Unlocked!</p>
          ) : (
            <p className="text-sm font-medium">🚚 Add ₹{399 - (deliveryInfo.deliveryCharge === 0 ? 399 : 0)} more for Free Delivery!</p>
          )}
        </div>
      </div>
      
      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-2">
          <span className={giftTier >= 1 ? "text-yellow-300" : "text-gray-300"}>
            {giftTier >= 1 ? "🎁" : "🔒"} ₹399+ → 1 Free Gift
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={giftTier >= 2 ? "text-yellow-300" : "text-gray-300"}>
            {giftTier >= 2 ? "🎁🎁" : "🔒"} ₹699+ → 2 Free Gifts
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={giftTier >= 3 ? "text-yellow-300" : "text-gray-300"}>
            {giftTier >= 3 ? "🎁🎁🎁" : "🔒"} ₹999+ → 3 Free Gifts
          </span>
        </div>
      </div>
    </div>
  )
}