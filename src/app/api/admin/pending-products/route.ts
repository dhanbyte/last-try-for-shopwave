import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import VendorProduct from '@/models/VendorProduct'
import Vendor from '@/models/Vendor'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    // Get all pending vendor products
    const pendingProducts = await VendorProduct.find({ 
      status: 'pending' 
    }).sort({ createdAt: -1 })
    
    // Get vendor details for each product
    const productsWithVendor = await Promise.all(
      pendingProducts.map(async (product) => {
        const vendor = await Vendor.findById(product.vendorId)
        return {
          ...product.toObject(),
          vendorName: vendor?.businessName || vendor?.name || 'Unknown Vendor',
          vendorEmail: vendor?.email
        }
      })
    )

    return NextResponse.json({ 
      success: true, 
      products: productsWithVendor 
    })
  } catch (error) {
    console.error('Error fetching pending products:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch pending products' 
    })
  }
}