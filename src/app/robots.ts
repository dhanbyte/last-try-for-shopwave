import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/vendor/login', '/vendor/register'],
    },
    sitemap: [
      'https://shopwave.social/sitemap.xml',
      'https://shopwave.social/image-sitemap.xml'
    ],
  }
}