import type { Metadata } from 'next'

type Props = {
  params: { name: string }
}

const categories = {
  'tech': {
    title: 'Tech Accessories',
    description: 'Best tech accessories at lowest prices - Mobile covers, chargers, earphones, speakers & more. Free delivery across India!',
    keywords: 'tech accessories, mobile accessories, chargers, earphones, speakers, phone covers, tech gadgets India'
  },
  'home': {
    title: 'Home & Kitchen',
    description: 'Home essentials & kitchen items at best prices - Cookware, storage, decor, appliances & more. Shop home products online!',
    keywords: 'home products, kitchen items, cookware, home decor, storage solutions, household items India'
  },
  'fashion': {
    title: 'Fashion & Clothing',
    description: 'Latest fashion trends at affordable prices - Clothing, shoes, accessories for men, women & kids. Free delivery!',
    keywords: 'fashion, clothing, shoes, accessories, mens fashion, womens fashion, kids fashion India'
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = categories[params.name as keyof typeof categories]
  
  if (!category) {
    return {
      title: 'Category Not Found - ShopWave',
      description: 'The category you are looking for is not available.'
    }
  }

  return {
    title: `${category.title} - Best Prices Online | ShopWave`,
    description: category.description,
    keywords: category.keywords,
    openGraph: {
      title: `${category.title} - Best Prices Online | ShopWave`,
      description: category.description,
      type: 'website',
      url: `/category/${params.name}`,
    },
    alternates: {
      canonical: `/category/${params.name}`
    }
  }
}

export default function CategoryPage({ params }: Props) {
  const category = categories[params.name as keyof typeof categories]
  
  if (!category) {
    return <div>Category not found</div>
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": category.title,
            "description": category.description,
            "url": `/category/${params.name}`
          })
        }}
      />
      <h1>{category.title}</h1>
      <p>{category.description}</p>
    </div>
  )
}