import mongoose from 'mongoose'

const VendorOrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  vendorId: { type: String, required: true, index: true },
  customerId: { type: String, required: true },
  customerDetails: {
    name: String,
    email: String,
    phone: String
  },
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  vendorTotal: { type: Number, required: true },
  commission: { type: Number, required: true },
  netAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending',
    index: true
  },
  shippingAddress: Object,
  paymentId: String,
  createdAt: { type: Date, default: Date.now }
})

// Compound index for efficient vendor stats queries
VendorOrderSchema.index({ vendorId: 1, status: 1 })
VendorOrderSchema.index({ vendorId: 1, createdAt: -1 })

export default mongoose.models.VendorOrder || mongoose.model('VendorOrder', VendorOrderSchema)