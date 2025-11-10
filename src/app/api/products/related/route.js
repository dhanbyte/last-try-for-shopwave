import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'tech'
    const exclude = searchParams.get('exclude')
    const limit = parseInt(searchParams.get('limit') || '8')

    await client.connect()
    const db = client.db(process.env.MONGODB_DB_NAME)
    const productsCollection = db.collection('products')
    const vendorsCollection = db.collection('vendors')

    // Get active vendors (not suspended)
    const activeVendors = await vendorsCollection
      .find({ status: { $ne: 'suspended' } })
      .project({ _id: 1 })
      .toArray()
    
    const activeVendorIds = activeVendors.map(v => v._id.toString())

    const query = { 
      category,
      $or: [
        { vendorId: { $exists: false } }, // Regular products
        { vendorId: { $in: activeVendorIds } } // Products from active vendors only
      ],
      ...(exclude && { _id: { $ne: exclude } })
    }

    const relatedProducts = await productsCollection
      .find(query)
      .limit(limit)
      .toArray()

    const formattedProducts = relatedProducts.map(product => ({
      id: product._id,
      name: product.name,
      brand: product.brand,
      slug: product.slug || product._id,
      image: product.images?.[0] || '/placeholder-product.jpg',
      price: {
        original: product.originalPrice || product.price,
        discounted: product.discountPrice || product.price
      },
      ratings: {
        average: 4.5,
        count: Math.floor(Math.random() * 100) + 10
      },
      quantity: product.stock || 0
    }))

    return NextResponse.json({ 
      success: true, 
      products: formattedProducts 
    })

  } catch (error) {
    console.error('Error fetching related products:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch related products' 
    }, { status: 500 })
  } finally {
    await client.close()
  }
}