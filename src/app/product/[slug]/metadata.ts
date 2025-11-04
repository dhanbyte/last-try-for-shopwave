import type { Metadata } from 'next'
import { generateProductMetadata } from '@/lib/seo'
import { connectToDatabase } from '@/lib/mongodb'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const { db } = await connectToDatabase()
    const product = await db.collection('products').findOne({ 
      $or: [
        { slug: params.slug },
        { _id: params.slug }
      ]
    })

    if (!product) {
      return {
        title: 'Product Not Found - ShopWave',
        description: 'The product you are looking for is not available.',
      }
    }

    return generateProductMetadata(product)
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'ShopWave - Online Shopping',
      description: 'Shop the best products at ShopWave with free delivery across India.',
    }
  }
}