import mongoose from 'mongoose'

// Delete existing models to avoid cache issues
if (mongoose.models.VendorProduct) {
  delete mongoose.models.VendorProduct
}
if (mongoose.models.VendorProductNew) {
  delete mongoose.models.VendorProductNew
}

const VendorProductSchema = new mongoose.Schema({
  vendorId: { type: String, required: true, index: true },
  productId: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String },
  tertiaryCategory: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discountPrice: { type: Number },
  images: [{ type: String }],
  description: { type: String, required: true },
  stock: { type: Number, default: 0 },
  brand: String,
  status: { type: String, enum: ['active', 'blocked', 'pending'], default: 'active', index: true },
  createdAt: { type: Date, default: Date.now }
})

// Compound indexes for efficient queries
VendorProductSchema.index({ vendorId: 1, status: 1 })
VendorProductSchema.index({ vendorId: 1, createdAt: -1 })

export default mongoose.models.VendorProductNew || mongoose.model('VendorProductNew', VendorProductSchema)