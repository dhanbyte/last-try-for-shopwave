import type { Metadata } from 'next'
import type { Product } from './types'

export function generateProductMetadata(product: Product): Metadata {
  const price = product.price.discounted ?? product.price.original
  const images = [product.image, ...(product.extraImages || [])]
  
  const title = `${product.name} - ₹${price} | Buy Online at ShopWave`
  const description = `Buy ${product.name} by ${product.brand} at best price ₹${price} on ShopWave. ${product.shortDescription || product.description.substring(0, 120)}. Free delivery across India!`
  
  const keywords = [
    product.name,
    product.brand,
    product.category,
    product.subcategory,
    'buy online',
    'best price',
    'ShopWave',
    'online shopping',
    'India',
    'free delivery',
    ...(product.features || []),
    ...product.name.split(' '),
    `${product.brand} ${product.category}`,
    `buy ${product.name}`,
    `${product.name} price`,
    `${product.name} online`,
    `best ${product.category}`,
    `${product.category} India`
  ].filter(Boolean).join(', ')

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'ShopWave' }],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      type: 'product',
      url: `https://shopwave.social/product/${product.slug}`,
      siteName: 'ShopWave',
      images: images.map(img => ({
        url: img,
        width: 1200,
        height: 630,
        alt: product.name,
        type: 'image/jpeg',
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{
        url: product.image,
        alt: product.name,
      }],
    },
    alternates: {
      canonical: `https://shopwave.social/product/${product.slug}`,
    },
    other: {
      'product:price:amount': String(price),
      'product:price:currency': 'INR',
      'product:availability': product.quantity > 0 ? 'in stock' : 'out of stock',
      'product:brand': product.brand,
      'product:category': product.category,
      'product:condition': 'new',
      'image': product.image,
      'image:alt': product.name,
      'image:width': '1200',
      'image:height': '630',
    },
  }
}