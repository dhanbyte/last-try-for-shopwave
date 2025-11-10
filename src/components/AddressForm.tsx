'use client'
import { useState, useCallback, useMemo } from 'react'

type Address = {
  id: string
  fullName: string
  phone: string
  pincode: string
  line1: string
  line2: string
  city: string
  state: string
  landmark: string
  default: boolean
}

const required = (s?: string) => !!(s && s.trim().length)

export default function AddressForm({ action, initial, onCancel }: { action: (a: Omit<Address, 'id'>) => void; initial?: Partial<Address>; onCancel?: () => void }) {
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Initialize form data once
  const initialData = useMemo(() => ({
    fullName: initial?.fullName || '',
    phone: initial?.phone || '',
    pincode: initial?.pincode || '',
    line1: initial?.line1 || '',
    line2: initial?.line2 || '',
    city: initial?.city || '',
    state: initial?.state || '',
    landmark: initial?.landmark || ''
  }), [initial])
  
  const [formData, setFormData] = useState(initialData)

  const toast = useCallback(({ title, description }: any) => {
    alert(`${title}: ${description}`)
  }, [])

  const handleSave = useCallback(async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    const a: Omit<Address, 'id'> = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.replace(/\s/g, ''),
        pincode: formData.pincode.trim(),
        line1: formData.line1.trim(),
        line2: formData.line2.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        landmark: formData.landmark.trim(),
        default: false,
    }

    const newErrors: Record<string, string> = {}
    if (!required(a.fullName)) newErrors.fullName = "Full name is required."
    if (!/^[0-9]{10}$/.test(a.phone)) newErrors.phone = "Must be a valid 10-digit phone number."
    if (!/^[0-9]{6}$/.test(a.pincode)) newErrors.pincode = "Must be a 6-digit pincode."
    if (!required(a.line1)) newErrors.line1 = "Building/Floor is required."
    if (!required(a.city)) newErrors.city = "City is required."
    if (!required(a.state)) newErrors.state = "State is required."
    
    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      try {
        await action(a)
        toast({
          title: "Address Saved",
          description: "Your address has been saved successfully.",
        })
      } catch (error) {
        console.error('Address save error:', error)
        toast({
          title: "Error",
          description: "Failed to save address. Please try again.",
        })
      }
    }
    
    setIsSubmitting(false)
  }, [action, formData, isSubmitting, toast])

  const updateField = useCallback((name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <input 
            className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`} 
            placeholder="Full Name*" 
            value={formData.fullName}
            type="text"
            autoComplete="off"
            onChange={(e) => updateField('fullName', e.target.value)}
          />
          {errors.fullName && <div className="mt-1 text-xs text-red-600">{errors.fullName}</div>}
        </div>
        
        <div>
          <input 
            className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} 
            placeholder="Phone*" 
            value={formData.phone}
            type="tel"
            autoComplete="off"
            onChange={(e) => updateField('phone', e.target.value)}
          />
          {errors.phone && <div className="mt-1 text-xs text-red-600">{errors.phone}</div>}
        </div>
        
        <div>
          <input 
            className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.pincode ? 'border-red-500' : 'border-gray-300'}`} 
            placeholder="Pincode (6 digits)*" 
            value={formData.pincode}
            type="text"
            autoComplete="off"
            onChange={(e) => updateField('pincode', e.target.value)}
          />
          {errors.pincode && <div className="mt-1 text-xs text-red-600">{errors.pincode}</div>}
        </div>
        
        <div>
          <input 
            className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.city ? 'border-red-500' : 'border-gray-300'}`} 
            placeholder="City*" 
            value={formData.city}
            type="text"
            autoComplete="off"
            onChange={(e) => updateField('city', e.target.value)}
          />
          {errors.city && <div className="mt-1 text-xs text-red-600">{errors.city}</div>}
        </div>
        
        <div className="md:col-span-2">
          <input 
            className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.line1 ? 'border-red-500' : 'border-gray-300'}`} 
            placeholder="Building/Floor*" 
            value={formData.line1}
            type="text"
            autoComplete="off"
            onChange={(e) => updateField('line1', e.target.value)}
          />
          {errors.line1 && <div className="mt-1 text-xs text-red-600">{errors.line1}</div>}
        </div>
        
        <div className="md:col-span-2">
          <input 
            className="w-full rounded-lg border px-3 py-2 text-sm border-gray-300" 
            placeholder="Street/Area (optional)" 
            value={formData.line2}
            type="text"
            autoComplete="off"
            onChange={(e) => updateField('line2', e.target.value)}
          />
        </div>
        
        <div>
          <select 
            value={formData.state}
            onChange={(e) => updateField('state', e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
            title="Select State"
          >
            <option value="">Select State*</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
            <option value="Assam">Assam</option>
            <option value="Bihar">Bihar</option>
            <option value="Chhattisgarh">Chhattisgarh</option>
            <option value="Goa">Goa</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Haryana">Haryana</option>
            <option value="Himachal Pradesh">Himachal Pradesh</option>
            <option value="Jharkhand">Jharkhand</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Kerala">Kerala</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Manipur">Manipur</option>
            <option value="Meghalaya">Meghalaya</option>
            <option value="Mizoram">Mizoram</option>
            <option value="Nagaland">Nagaland</option>
            <option value="Odisha">Odisha</option>
            <option value="Punjab">Punjab</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Sikkim">Sikkim</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Telangana">Telangana</option>
            <option value="Tripura">Tripura</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Uttarakhand">Uttarakhand</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Delhi">Delhi</option>
          </select>
          {errors.state && <div className="mt-1 text-xs text-red-600">{errors.state}</div>}
        </div>
        
        <div>
          <input 
            className="w-full rounded-lg border px-3 py-2 text-sm border-gray-300" 
            placeholder="Landmark (optional)" 
            value={formData.landmark}
            type="text"
            autoComplete="off"
            onChange={(e) => updateField('landmark', e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3 pt-2">
        <button 
          type="button" 
          onClick={handleSave} 
          disabled={isSubmitting}
          className="rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Address'}
        </button>
        {onCancel && <button type="button" onClick={onCancel} className="rounded-xl border px-5 py-2 text-sm font-semibold">Cancel</button>}
      </div>
    </div>
  )
}