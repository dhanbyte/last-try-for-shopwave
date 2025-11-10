import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import VendorOrder from '@/models/VendorOrder'

export async function GET() {
  try {
    await dbConnect()
    
    // Get all vendor orders to debug
    const allOrders = await VendorOrder.find({}).sort({ createdAt: -1 })
    
    return NextResponse.json({ 
      success: true, 
      orders: allOrders,
      count: allOrders.length,
      vendorIds: [...new Set(allOrders.map(o => o.vendorId))]
    })

  } catch (error) {
    console.error('Error fetching debug orders:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch orders'
    })
  }
}