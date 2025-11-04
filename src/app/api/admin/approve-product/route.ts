import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import VendorProduct from '@/models/VendorProduct'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Product ID required' 
      }, { status: 400 })
    }

    // Update product status to active (approved)
    const product = await (VendorProduct as any).findByIdAndUpdate(
      productId,
      { 
        status: 'active',
        updatedAt: new Date() 
      },
      { new: true }
    )

    if (!product) {
      return NextResponse.json({ 
        success: false, 
        message: 'Product not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Product approved and will now show on website',
      product 
    })
  } catch (error) {
    console.error('Error approving product:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to approve product' 
    }, { status: 500 })
  }
}