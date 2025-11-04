// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import AdminProduct from '@/models/AdminProduct'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const products = await AdminProduct.find({}).sort({ createdAt: -1 })

    return NextResponse.json({ 
      success: true, 
      products 
    })
  } catch (error) {
    console.error('Error fetching admin products:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch products' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const productData = await request.json()
    console.log('Received admin product data:', productData)
    
    // Generate unique ID
    const productId = `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newProduct = new AdminProduct({
      id: productId,
      name: productData.name,
      description: productData.description,
      price: {
        original: productData.price,
        discounted: productData.price
      },
      image: productData.image,
      category: productData.category,
      subcategory: productData.subcategory,
      tertiaryCategory: productData.tertiaryCategory,
      quantity: productData.stock || 0,
      isNewProduct: true
    })
    
    const savedProduct = await newProduct.save()
    console.log('Admin product saved:', savedProduct._id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Product added successfully',
      product: savedProduct
    })
  } catch (error) {
    console.error('Error adding admin product:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to add product' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const { productId, status } = await request.json()

    if (!productId || !status) {
      return NextResponse.json({ 
        success: false, 
        message: 'Product ID and status required' 
      }, { status: 400 })
    }

    const product = await AdminProduct.findByIdAndUpdate(
      productId,
      { status, updatedAt: new Date() },
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

    const product = await AdminProduct.findByIdAndDelete(productId)

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
