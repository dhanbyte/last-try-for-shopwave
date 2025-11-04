import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const products = await db.collection('products').find({}, { 
      projection: { slug: 1, name: 1, image: 1, extraImages: 1, _id: 1 } 
    }).toArray()

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${products.map(product => {
  const images = [product.image, ...(product.extraImages || [])].filter(Boolean)
  return `  <url>
    <loc>https://shopwave.social/product/${product.slug || product._id}</loc>
${images.map(img => `    <image:image>
      <image:loc>${img}</image:loc>
      <image:caption>${product.name}</image:caption>
      <image:title>${product.name}</image:title>
    </image:image>`).join('\n')}
  </url>`
}).join('\n')}
</urlset>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('Error generating image sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}