import mongoose from 'mongoose'

const VendorSchema = new mongoose.Schema({
  // Basic Information
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  vendorId: { type: String, unique: true },
  name: { type: String, required: true },
  businessName: { type: String, required: true },
  brandName: String,
  phone: String,
  
  // Business Details
  businessType: { type: String, enum: ['Individual', 'Partnership', 'Private Limited', 'LLP', 'Other', 'manufacturer'] },
  gstNumber: String,
  panNumber: String,
  aadharNumber: String,
  profilePhoto: String,
  
  // Address
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  
  // Bank Details
  bankDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    accountHolder: String,
    accountType: { type: String, enum: ['Savings', 'Current'] }
  },
  
  // Status & Approval
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'suspended'], 
    default: 'pending' 
  },
  
  // Documents
  documents: [{
    type: { type: String, enum: ['business_license', 'gst_certificate', 'pan_card', 'bank_statement', 'other'] },
    url: String,
    verified: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Financial
  commission: { type: Number, default: 15 }, // Admin commission %
  totalEarnings: { type: Number, default: 0 },
  pendingPayments: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  
  // Performance Metrics
  totalProducts: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  
  // Settings
  settings: {
    autoApproveProducts: { type: Boolean, default: false },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  approvedAt: Date,
  approvedBy: String,
  lastLoginAt: Date
}, { timestamps: true })

// Additional indexes for performance
VendorSchema.index({ email: 1 })
VendorSchema.index({ vendorId: 1 })
VendorSchema.index({ status: 1 })

// Generate unique vendor ID before save
VendorSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  if (!this.vendorId) {
    this.vendorId = 'VND' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase()
  }
  next()
})

export default mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema)