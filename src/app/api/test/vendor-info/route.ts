import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import VendorOrder from '@/models/VendorOrder'

export async function GET(request: Request) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')
    
    // Get all vendor orders for this vendor
    const orders = await VendorOrder.find({ vendorId }).sort({ createdAt: -1 })
    
    return NextResponse.json({ 
      success: true,
      vendorId,
      ordersCount: orders.length,
      orders: orders
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get vendor info'
    })
  }
}