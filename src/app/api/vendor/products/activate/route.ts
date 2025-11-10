import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import VendorProduct from '@/models/VendorProduct'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    // Update all vendor products to active status
    const result = await VendorProduct.updateMany(
      { status: { $ne: 'active' } },
      { status: 'active' }
    )

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${result.modifiedCount} products to active status`
    })

  } catch (error) {
    console.error('Error activating products:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to activate products' 
    })
  }
}