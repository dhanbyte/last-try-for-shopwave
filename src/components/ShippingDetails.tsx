'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Package, Truck } from 'lucide-react'
import { getShippingDetails } from '@/lib/utils/shipping'

type ShippingDetailsProps = {
  items: Array<{
    id: string
    qty: number
    weight?: number
    name: string
    category?: string
  }>
}

export default function ShippingDetails({ items }: ShippingDetailsProps) {
  const [showDetails, setShowDetails] = useState(false)
  const shippingDetails = getShippingDetails(items)

  return (
    <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            Shipping Details ({shippingDetails.totalWeightKg}kg)
          </span>
        </div>
        {showDetails ? (
          <ChevronUp className="h-4 w-4 text-blue-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-blue-600" />
        )}
      </div>
      
      {showDetails && (
        <div className="mt-3 space-y-2 text-xs text-blue-700">
          <div className="flex justify-between">
            <span>Total Weight:</span>
            <span>{shippingDetails.totalWeightKg}kg</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping Cost:</span>
            <span>₹{shippingDetails.shippingCost}</span>
          </div>
          <div className="flex justify-between">
            <span>Packaging Weight:</span>
            <span>{shippingDetails.packagingWeight}g</span>
          </div>
          
          <div className="border-t border-blue-200 pt-2 mt-2">
            <div className="font-medium mb-1">Weight Breakdown:</div>
            {shippingDetails.breakdown.map((item, index) => (
              <div key={item.id} className="flex justify-between text-xs">
                <span className="truncate flex-1 mr-2">
                  {item.name} (x{item.qty})
                </span>
                <span>{item.totalWeight}g</span>
              </div>
            ))}
          </div>
          
          <div className="text-xs text-blue-600 mt-2 p-2 bg-blue-100 rounded">
            <Package className="h-3 w-3 inline mr-1" />
            Shipping rates: 0-0.5kg: ₹49 | 0.5-1kg: ₹79 | 1-2kg: ₹99 | 2-3kg: ₹110 | 3-4kg: ₹129 | 4-5kg: ₹149 | 5-10kg: ₹230
          </div>
        </div>
      )}
    </div>
  )
}