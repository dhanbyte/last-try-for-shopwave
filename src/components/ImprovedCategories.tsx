'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

const categories = [
  {
    name: 'Electronics',
    emoji: '📱',
    image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/01_0748acd3-4797-400f-997d-6cecf6b22f5a.webp?updatedAt=1756628128432',
    href: '/search?category=Tech',
    color: 'from-blue-500 to-purple-600'
  },
  {
    name: 'Home & Kitchen',
    emoji: '🏠',
    image: 'https://Shopwave.b-cdn.net/new%20arival/17865..1.webp',
    href: '/search?category=Home',
    color: 'from-green-500 to-teal-600'
  },
  {
    name: 'Fashion',
    emoji: '👕',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    href: '/search?category=Fashion',
    color: 'from-pink-500 to-rose-600'
  },
  {
    name: 'New Arrivals',
    emoji: '✨',
    image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_6d35b019-089f-4949-9571-7a7bd595fccd.webp',
    href: '/new-arrivals',
    color: 'from-orange-500 to-red-600'
  }
]

export default function ImprovedCategories() {
  return (
    <section className="py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Shop by Category</h2>
        <Link href="/categories" className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* Mobile Layout - 2 columns */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className="group relative overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="aspect-[4/3] relative">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-80`} />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                <div className="text-2xl mb-1">{category.emoji}</div>
                <h3 className="text-sm font-bold text-white text-center leading-tight">
                  {category.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Tablet Layout - 4 columns */}
      <div className="hidden md:grid lg:hidden grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className="group relative overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
          >
            <div className="aspect-[4/3] relative">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-75`} />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <div className="text-3xl mb-2">{category.emoji}</div>
                <h3 className="text-base font-bold text-white text-center">
                  {category.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop Layout - 4 columns with larger cards */}
      <div className="hidden lg:grid grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className="group relative overflow-hidden rounded-2xl bg-white shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="aspect-[4/3] relative">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-70 group-hover:opacity-80 transition-opacity duration-300`} />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {category.emoji}
                </div>
                <h3 className="text-lg font-bold text-white text-center group-hover:scale-105 transition-transform duration-300">
                  {category.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}