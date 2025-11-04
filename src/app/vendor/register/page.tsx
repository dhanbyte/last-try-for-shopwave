'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building, User, Phone, Mail, MapPin, CreditCard, FileText, CheckCircle } from 'lucide-react'

export default function VendorRegister() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: 'Individual',
    brandName: '',
    
    // Address
    street: '',
    city: '',
    state: '',
    pincode: '',
    
    // Business Details
    gstNumber: '',
    panNumber: '',
    aadharNumber: '',
    
    // Bank Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolder: '',
    accountType: 'Savings'
  })
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const steps = [
    { id: 1, title: 'Basic Information', icon: User },
    { id: 2, title: 'Business Details', icon: Building },
    { id: 3, title: 'Address Information', icon: MapPin },
    { id: 4, title: 'Bank Details', icon: CreditCard },
    { id: 5, title: 'Review & Submit', icon: CheckCircle }
  ]

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return // Prevent multiple submissions

    setLoading(true)

    try {
      // Upload photo to ImageKit if exists
      let photoUrl = null
      if (profilePhoto) {
        try {
          const formDataPhoto = new FormData()
          formDataPhoto.append('file', profilePhoto)
          formDataPhoto.append('fileName', `vendor-${Date.now()}`)
          formDataPhoto.append('folder', '/vendor-profiles')
          
          const uploadResponse = await fetch('/api/imagekit/upload', {
            method: 'POST',
            body: formDataPhoto
          })
          
          const uploadData = await uploadResponse.json()
          console.log('Upload response:', uploadData)
          
          if (uploadData.success) {
            photoUrl = uploadData.url
            console.log('Photo uploaded successfully:', photoUrl)
          } else {
            console.error('Photo upload failed:', uploadData.message)
            alert('Photo upload failed: ' + uploadData.message)
          }
        } catch (uploadError) {
          console.error('Photo upload error:', uploadError)
          alert('Photo upload error. Continuing without photo.')
        }
      }

      const response = await fetch('/api/vendor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          profilePhoto: photoUrl,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode
          },
          bankDetails: {
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode,
            accountHolder: formData.accountHolder,
            accountType: formData.accountType
          }
        })
      })

      const data = await response.json()
      console.log('Registration response:', data)
      
      if (data.success) {
        toast({ title: "Success", description: "Registration successful! Redirecting to dashboard..." })
        
        // Auto-login the user
        if (data.vendor) {
          localStorage.setItem('vendorId', data.vendor.vendorId || data.vendor._id)
          localStorage.setItem('vendorEmail', data.vendor.email)
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/vendor/dashboard')
          }, 2000)
        }
      } else {
        // Show specific error message without console.error since this is expected behavior
        const errorMessage = data.error || 'Registration failed'
        const suggestion = data.suggestion || ''
        const fullMessage = suggestion ? `${errorMessage} ${suggestion}` : errorMessage

        toast({
          title: "Registration Failed",
          description: fullMessage,
          variant: "destructive"
        })

        // If account is approved, suggest login
        if (data.status === 'approved') {
          setTimeout(() => {
            toast({
              title: "Already Registered?",
              description: "Click here to login to your account",
              action: (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/vendor/login'}
                >
                  Login
                </Button>
              )
            })
          }, 2000)
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Registration failed" })
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🏪 Become a Vendor</h1>
          <p className="text-gray-600">Join our marketplace and start selling your products</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3 hidden md:block">
                    <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      Step {step.id}
                    </div>
                    <div className="text-xs text-gray-500">{step.title}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                
                {/* Profile Photo */}
                <div className="flex justify-center mb-6">
                  <div className="text-center">
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-4 mx-auto overflow-hidden">
                      {profilePhoto ? (
                        <img src={URL.createObjectURL(profilePhoto)} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Upload Photo *
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
                        className="hidden"
                        required
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Upload your profile photo</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="Enter your email address (use the same email you want to login with)"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Make sure this is the email address you want to use for your vendor account
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Business Name *</label>
                    <Input
                      value={formData.businessName}
                      onChange={(e) => updateFormData('businessName', e.target.value)}
                      placeholder="Enter your business name"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Brand Name *</label>
                    <Input
                      value={formData.brandName}
                      onChange={(e) => updateFormData('brandName', e.target.value)}
                      placeholder="Enter your brand name (this will be used for all your products)"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Business Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Business Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Business Type *</label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => updateFormData('businessType', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Individual">Individual</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Private Limited">Private Limited</option>
                      <option value="LLP">LLP</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">GST Number</label>
                    <Input
                      value={formData.gstNumber}
                      onChange={(e) => updateFormData('gstNumber', e.target.value)}
                      placeholder="Enter GST number (optional)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">PAN Number *</label>
                    <Input
                      value={formData.panNumber}
                      onChange={(e) => updateFormData('panNumber', e.target.value)}
                      placeholder="Enter PAN number"
                      maxLength={10}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Aadhar Number *</label>
                    <Input
                      value={formData.aadharNumber}
                      onChange={(e) => updateFormData('aadharNumber', e.target.value)}
                      placeholder="Enter Aadhar number"
                      maxLength={12}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Address */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Address Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Street Address *</label>
                    <Input
                      value={formData.street}
                      onChange={(e) => updateFormData('street', e.target.value)}
                      placeholder="Enter street address"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">City *</label>
                      <Input
                        value={formData.city}
                        onChange={(e) => updateFormData('city', e.target.value)}
                        placeholder="Enter city"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">State *</label>
                      <Input
                        value={formData.state}
                        onChange={(e) => updateFormData('state', e.target.value)}
                        placeholder="Enter state"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Pincode *</label>
                      <Input
                        value={formData.pincode}
                        onChange={(e) => updateFormData('pincode', e.target.value)}
                        placeholder="Enter pincode"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Bank Details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Bank Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bank Name</label>
                    <Input
                      value={formData.bankName}
                      onChange={(e) => updateFormData('bankName', e.target.value)}
                      placeholder="Enter bank name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Holder Name</label>
                    <Input
                      value={formData.accountHolder}
                      onChange={(e) => updateFormData('accountHolder', e.target.value)}
                      placeholder="Enter account holder name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Number</label>
                    <Input
                      value={formData.accountNumber}
                      onChange={(e) => updateFormData('accountNumber', e.target.value)}
                      placeholder="Enter account number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">IFSC Code</label>
                    <Input
                      value={formData.ifscCode}
                      onChange={(e) => updateFormData('ifscCode', e.target.value)}
                      placeholder="Enter IFSC code"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Type</label>
                    <select
                      value={formData.accountType}
                      onChange={(e) => updateFormData('accountType', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Savings">Savings</option>
                      <option value="Current">Current</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-medium mb-4">Please review your information:</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Basic Information</h4>
                      <p>Name: {formData.name}</p>
                      <p>Email: {formData.email}</p>
                      <p>Phone: {formData.phone}</p>
                      <p>Business: {formData.businessName}</p>
                      <p>Brand: {formData.brandName}</p>
                      <p>PAN: {formData.panNumber}</p>
                      <p>Aadhar: {formData.aadharNumber}</p>
                      <p>Photo: {profilePhoto ? 'Uploaded' : 'Not uploaded'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Address</h4>
                      <p>{formData.street}</p>
                      <p>{formData.city}, {formData.state} - {formData.pincode}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    By submitting this application, you agree to our terms and conditions. 
                    Your application will be reviewed by our team within 2-3 business days.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                onClick={handlePrev}
                variant="outline"
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 5 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-gray-600 mb-2">Already have an account?</p>
          <Link
            href="/vendor/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login to Your Account
          </Link>
          <p className="text-xs text-gray-500 mt-2">
            If you're already registered, please login instead of creating a new account
          </p>
        </div>
      </div>
    </div>
  )
}