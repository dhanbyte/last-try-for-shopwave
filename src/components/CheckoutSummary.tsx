'use client'
import { useCart } from '@/lib/cartStore'
import { useState, useEffect } from 'react'

export default function CheckoutSummary() {
  const { total, deliveryInfo, paymentMethod, setPaymentMethod, items, totalTax } = useCart()
  const { deliveryCharge, codCharge, isFreeDelivery, gifts, giftTier } = deliveryInfo
  const [showGiftAnimation, setShowGiftAnimation] = useState(false)

  const cartSubtotal = items.reduce((s, i) => s + (i.qty * i.price), 0)

  useEffect(() => {
    if (gifts.length > 0) {
      setShowGiftAnimation(true)
      const timer = setTimeout(() => setShowGiftAnimation(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [gifts.length])

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border-2 border-gray-100">
      <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span className="text-2xl">📋</span>
        Order Summary
      </h3>
      
      {/* Cart Breakdown */}
      <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between text-gray-700">
          <span>Items ({items.length})</span>
          <span className="font-medium">₹{cartSubtotal}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Platform Fee</span>
          <span className="font-medium">₹{totalTax}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Delivery</span>
          <span className={`font-medium ${
            isFreeDelivery ? 'text-green-600' : 'text-orange-600'
          }`}>
            {isFreeDelivery ? 'FREE 🎉' : `₹${deliveryCharge}`}
          </span>
        </div>
        {codCharge > 0 && (
          <div className="flex justify-between text-orange-600">
            <span>COD Charge</span>
            <span className="font-medium">₹{codCharge}</span>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <label className="block text-lg font-semibold mb-3 text-gray-700">Payment Method</label>
        <div className="space-y-3">
          <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
            paymentMethod === 'Online' 
              ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105' 
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}>
            <input
              type="radio"
              name="payment"
              value="Online"
              checked={paymentMethod === 'Online'}
              onChange={() => setPaymentMethod('Online')}
              className="mr-3 w-5 h-5 text-blue-500"
            />
            <div className="flex-1">
              <span className="font-semibold text-gray-800">💳 Online Payment</span>
              <p className="text-sm text-gray-600">UPI, Card, Net Banking</p>
            </div>
            {paymentMethod === 'Online' && (
              <span className="text-blue-500 font-bold animate-pulse">✓</span>
            )}
          </label>
          <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
            paymentMethod === 'COD' 
              ? 'border-orange-500 bg-orange-50 shadow-md transform scale-105' 
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}>
            <input
              type="radio"
              name="payment"
              value="COD"
              checked={paymentMethod === 'COD'}
              onChange={() => setPaymentMethod('COD')}
              className="mr-3 w-5 h-5 text-orange-500"
            />
            <div className="flex-1">
              <span className="font-semibold text-gray-800">💵 Cash on Delivery</span>
              <p className="text-sm text-orange-600 font-medium">+₹25 COD charge</p>
            </div>
            {paymentMethod === 'COD' && (
              <span className="text-orange-500 font-bold animate-pulse">✓</span>
            )}
          </label>
        </div>
      </div>

      {/* Delivery Status Banner */}
      <div className={`p-4 rounded-xl mb-6 transition-all duration-500 ${
        isFreeDelivery 
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
          : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
      }`}>
        {isFreeDelivery ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🎁</span>
            <div>
              <p className="font-bold text-lg">Free Delivery Unlocked!</p>
              <p className="text-sm opacity-90">You saved ₹40 on delivery!</p>
            </div>
          </div>
        ) : (
          <div>
            <p className="font-semibold mb-2">🚚 Add ₹{399 - Math.floor(cartSubtotal)} more for Free Delivery!</p>
            <div className="w-full bg-white/30 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.min(100, (cartSubtotal / 399) * 100)}%` }}
              />
            </div>
            <p className="text-xs mt-1 opacity-90">{Math.floor((cartSubtotal / 399) * 100)}% progress to free delivery</p>
          </div>
        )}
      </div>

      {/* Gift Tiers Progress */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl mb-6 border-2 border-purple-200">
        <h4 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
          <span className="text-2xl animate-pulse">🎁</span>
          Gift Unlock Progress
        </h4>
        <div className="space-y-3">
          {[
            { tier: 1, amount: 399, giftCount: 1 },
            { tier: 2, amount: 699, giftCount: 2 },
            { tier: 3, amount: 999, giftCount: 3 }
          ].map(({ tier, amount, giftCount }) => {
            const isUnlocked = giftTier >= tier
            const progress = Math.min(100, (cartSubtotal / amount) * 100)
            
            return (
              <div 
                key={tier}
                className={`p-3 rounded-lg transition-all duration-500 ${
                  isUnlocked 
                    ? 'bg-gradient-to-r from-yellow-200 to-yellow-300 border-2 border-yellow-400 shadow-md' 
                    : 'bg-white border border-gray-200'
                } ${showGiftAnimation && giftTier === tier ? 'animate-bounce scale-110' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium flex items-center gap-2 ${
                    isUnlocked ? 'text-yellow-800' : 'text-gray-600'
                  }`}>
                    {isUnlocked ? (
                      <span className="text-xl animate-spin">{'🎁'.repeat(giftCount)}</span>
                    ) : (
                      <span className="text-gray-400">🔒</span>
                    )}
                    ₹{amount}+ → {giftCount} Gift{giftCount > 1 ? 's' : ''}
                  </span>
                  {isUnlocked ? (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                      UNLOCKED!
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm font-medium">
                      ₹{amount - Math.floor(cartSubtotal)} more
                    </span>
                  )}
                </div>
                {!isUnlocked && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Active Gifts Display */}
      {gifts.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl mb-6 border-2 border-green-300">
          <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
            <span className="text-2xl animate-bounce">🎉</span>
            Your Free Gifts ({gifts.length})
          </h4>
          <div className="space-y-3">
            {gifts.map((gift, index) => (
              <div 
                key={gift.id} 
                className={`flex items-center gap-4 p-3 bg-white rounded-lg shadow-md border-l-4 border-green-400 transition-all duration-500 ease-out`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <img src={gift.image} alt={gift.name} className="w-14 h-14 rounded-lg object-cover shadow-sm" />
                <div className="flex-1">
                  <span className="font-semibold text-gray-800">{gift.name}</span>
                  <p className="text-sm text-green-600 font-bold">✨ FREE GIFT ✨</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl animate-pulse">🎁</span>
                  <p className="text-xs text-green-600 font-bold">FREE</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final Total Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xl font-bold text-gray-800">Grand Total:</span>
          <span className="text-3xl font-bold text-blue-600 animate-pulse">₹{total}</span>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          {isFreeDelivery && (
            <p className="text-green-600 font-medium flex items-center gap-1">
              <span className="animate-bounce">🎉</span>
              You saved ₹40 on delivery!
            </p>
          )}
          {gifts.length > 0 && (
            <p className="text-yellow-600 font-medium flex items-center gap-1">
              <span className="animate-spin">🎁</span>
              {gifts.length} Free gift{gifts.length > 1 ? 's' : ''} worth ₹{gifts.length * 50}+ included!
            </p>
          )}
        </div>
      </div>


    </div>
  )
}