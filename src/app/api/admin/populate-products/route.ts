import { NextResponse } from 'next/server'
import { TECH_PRODUCTS } from '@/lib/data/tech'
import { HOME_PRODUCTS } from '@/lib/data/home'

let dbConnect: any
let Product: any

try {
  dbConnect = require('@/lib/dbConnect').default
  Product = require('@/models/Product').default
} catch (error) {
  console.warn('Database modules not available')
}

export async function POST() {
  try {
    if (!dbConnect || !Product) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not available' 
      }, { status: 500 })
    }

    await dbConnect()

    // Combine all products and filter out fashion products
    const allProducts = [...TECH_PRODUCTS, ...HOME_PRODUCTS]
    const nonFashionProducts = allProducts.filter(product => 
      product.category && 
      !product.category.toLowerCase().includes('fashion')
    )

    console.log(`Processing ${nonFashionProducts.length} non-fashion products`)

    let insertedCount = 0
    let updatedCount = 0
    let errorCount = 0

    for (const product of nonFashionProducts) {
      try {
        const transformedProduct = {
          slug: product.slug || product.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || product.id,
          name: product.name,
          brand: product.brand,
          description: product.description || product.shortDescription || 'No description available',
          shortDescription: product.shortDescription,
          price: {
            original: product.price?.original || product.price?.discounted || 0,
            discounted: product.price?.discounted,
            currency: product.price?.currency || '₹'
          },
          image: product.image,
          extraImages: product.extraImages || [],
          category: product.category,
          subcategory: product.subcategory,
          tertiaryCategory: product.tertiaryCategory,
          features: product.features || [],
          specifications: product.specifications || {},
          quantity: product.quantity || 100,
          sku: product.sku,
          taxPercent: product.taxPercent || 18,
          inventory: {
            inStock: true,
            lowStockThreshold: 5
          },
          ratings: {
            average: product.ratings?.average || 0,
            count: product.ratings?.count || 0
          },
          status: 'active',
          returnPolicy: {
            eligible: true,
            duration: 7
          },
          warranty: '1 Year Warranty'
        }

        // Check if product already exists
        const existingProduct = await Product.findOne({ slug: transformedProduct.slug })
        
        if (existingProduct) {
          // Update existing product
          await Product.findOneAndUpdate(
            { slug: transformedProduct.slug },
            transformedProduct,
            { new: true }
          )
          updatedCount++
        } else {
          // Create new product
          await Product.create(transformedProduct)
          insertedCount++
        }

      } catch (error) {
        console.error(`Error processing product ${product.name}:`, error)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Products populated successfully`,
      stats: {
        total: nonFashionProducts.length,
        inserted: insertedCount,
        updated: updatedCount,
        errors: errorCount
      }
    })

  } catch (error) {
    console.error('Error populating products:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to populate products' 
    }, { status: 500 })
  }
}