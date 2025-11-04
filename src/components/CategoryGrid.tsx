'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

type CategoryGridItem = {
  _id?: string
  id?: string
  name: string
  slug?: string
  href?: string
  image: string
  dataAiHint?: string
}

interface CategoryGridProps {
  buttonColor?: string
  categories?: CategoryGridItem[]
}

const defaultCategories: CategoryGridItem[] = [
  { _id: '1', name: 'Tech', slug: 'tech', image: '/images/placeholder.jpg' },
  { _id: '2', name: 'Home', slug: 'home', image: '/images/placeholder.jpg' },
  { _id: '3', name: 'Fashion', slug: 'fashion', image: '/images/placeholder.jpg' },
  { _id: '4', name: 'New Arrivals', slug: 'new-arrivals', image: '/images/placeholder.jpg' }
]

export default function CategoryGrid({ buttonColor, categories: override }: CategoryGridProps) {
  const [categories, setCategories] = useState<CategoryGridItem[]>(override ?? defaultCategories)

  useEffect(() => {
    if (override?.length) {
      setCategories(override)
      return
    }

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories)
        } else {
          console.log('No categories from API, using defaults')
        }
      })
      .catch(error => {
        console.error('Categories API error:', error)
      })
  }, [override])

  return (
    <section>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {categories.map((category) => (
          <Link
            key={category._id ?? category.id ?? category.slug ?? category.href ?? category.name}
            href={category.href ?? (category.slug ? `/category/${category.slug}` : '#')}
            className="group block"
          >
            <div className="relative overflow-hidden rounded-xl shadow-sm group-hover:shadow-lg transition-shadow duration-300">
              <Image
                src={category.image}
                alt={category.name}
                width={400}
                height={300}
                className="w-full aspect-[4/3] object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-3 md:p-4">
                <h3 className="text-white text-md md:text-xl font-semibold">{category.name}</h3>
                <Button size="sm" className={cn("mt-2 h-8 px-3 text-xs", buttonColor)}>
                  Shop Now
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
