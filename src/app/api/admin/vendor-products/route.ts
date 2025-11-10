import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import VendorProduct from '@/models/VendorProduct'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/admin/vendor-products called')
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')

    // If vendorId provided, fetch products for that vendor only
    // If no vendorId, fetch all vendor products (for admin)
    const query = vendorId ? { vendorId } : {}
    const products = await VendorProduct.find(query).sort({ createdAt: -1 })

    return NextResponse.json({ 
      success: true, 
      products 
    })
  } catch (error) {
    console.error('Error fetching vendor products:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch products' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/admin/vendor-products called')
    await dbConnect()
    
    const body = await request.json()
    console.log('Request body:', body)
    const { productId, status } = body

    if (!productId || !status) {
      console.log('Missing productId or status')
      return NextResponse.json({ 
        success: false, 
        message: 'Product ID and status required' 
      }, { status: 400 })
    }

    console.log(`Updating product ${productId} to status ${status}`)
    const product = await VendorProduct.findByIdAndUpdate(
      productId,
      { status, updatedAt: new Date() },
      { new: true }
    )

    if (!product) {
      console.log('Product not found')
      return NextResponse.json({ 
        success: false, 
        message: 'Product not found' 
      }, { status: 404 })
    }

    console.log('Product updated successfully')
    return NextResponse.json({ 
      success: true, 
      message: `Product ${status} successfully` 
    })
  } catch (error) {
    console.error('Error updating product status:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update product status' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()
    
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Product ID required' 
      }, { status: 400 })
    }

    const product = await VendorProduct.findByIdAndDelete(productId)

    if (!product) {
      return NextResponse.json({ 
        success: false, 
        message: 'Product not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete product' 
    }, { status: 500 })
  }
}