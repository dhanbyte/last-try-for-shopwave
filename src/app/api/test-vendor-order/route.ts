import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import VendorOrder from '@/models/VendorOrder'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { vendorId } = await request.json()

    if (!vendorId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Vendor ID required' 
      }, { status: 400 })
    }

    // Create a test order
    const testOrder = new VendorOrder({
      orderId: `TEST${Date.now()}`,
      vendorId: vendorId,
      customerId: 'test@customer.com',
      items: [{
        productId: 'test-product',
        name: 'Test Product',
        price: 500,
        quantity: 1,
        image: 'test.jpg'
      }],
      vendorTotal: 500,
      commission: 75,
      netAmount: 425,
      status: 'pending',
      shippingAddress: {
        name: 'Test Customer',
        address: 'Test Address'
      }
    })

    await testOrder.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Test order created',
      order: testOrder
    })
  } catch (error) {
    console.error('Error creating test order:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to create test order' 
    }, { status: 500 })
  }
}