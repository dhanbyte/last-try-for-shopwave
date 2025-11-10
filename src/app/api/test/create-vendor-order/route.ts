import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import VendorOrder from '@/models/VendorOrder'

export async function POST() {
  try {
    await dbConnect()
    
    // Create a test vendor order
    const testOrder = new VendorOrder({
      orderId: `TEST-${Date.now()}`,
      vendorId: '68fc896a722d94a0967f2329', // Real vendorId from localStorage
      customerId: 'test-customer@example.com',
      items: [{
        productId: 'test-product-1',
        name: 'Test Product',
        price: 100,
        quantity: 1,
        image: 'https://example.com/image.jpg'
      }],
      vendorTotal: 100,
      commission: 10,
      netAmount: 90,
      status: 'pending',
      shippingAddress: {
        name: 'Test Customer',
        address: 'Test Address',
        city: 'Test City',
        pincode: '123456'
      }
    })
    
    await testOrder.save()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test vendor order created',
      order: testOrder
    })

  } catch (error) {
    console.error('Error creating test order:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create test order'
    })
  }
}