import { MetadataRoute } from 'next'
import { connectToDatabase } from '@/lib/mongodb'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://shopwave.social'
  
  try {
    const { db } = await connectToDatabase()
    const products = await db.collection('products').find({}, { 
      projection: { slug: 1, updatedAt: 1, _id: 1 } 
    }).toArray()

    const productUrls = products.map((product) => ({
      url: `${baseUrl}/product/${product.slug || product._id}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/products`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/new-arrivals`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      ...productUrls,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}