'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Sparkles } from 'lucide-react'

const fashionCategories = [
  {
    id: 'mens',
    title: "Men's Fashion",
    subtitle: "Shirts, Jeans, T-Shirts & More",
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    href: '/search?category=Men',
    gradient: 'from-blue-600 via-blue-500 to-indigo-600',
    icon: '👔',
    subcategories: [
      'Formal Shirts', 'Casual Shirts', 'T-Shirts', 'Polo T-Shirts', 
      'Jeans', 'Trousers', 'Formal Shoes', 'Casual Shoes'
    ]
  },
  {
    id: 'womens',
    title: "Women's Fashion",
    subtitle: "Dresses, Sarees, Kurtis & More",
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
    href: '/search?category=Women',
    gradient: 'from-pink-500 via-rose-500 to-purple-600',
    icon: '👗',
    subcategories: [
      'Dresses', 'Sarees', 'Kurtis', 'Tops', 
      'Jeans', 'Leggings', 'Heels', 'Handbags'
    ]
  },
  {
    id: 'kids',
    title: "Kids Fashion",
    subtitle: "Cute & Comfortable Clothing",
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400',
    href: '/search?category=Kids',
    gradient: 'from-orange-400 via-yellow-500 to-red-500',
    icon: '🧸',
    subcategories: [
      'Boys T-Shirts', 'Girls Dresses', 'Boys Shirts', 'Girls Tops',
      'Kids Jeans', 'Kids Shorts', 'Kids Shoes', 'School Uniforms'
    ]
  },
  {
    id: 'accessories',
    title: "Fashion Accessories",
    subtitle: "Complete Your Look",
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
    href: '/search?category=Accessories',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    icon: '⌚',
    subcategories: [
      'Watches', 'Sunglasses', 'Belts', 'Wallets',
      'Bags', 'Jewelry', 'Caps & Hats', 'Perfumes'
    ]
  }
]

export default function ModernFashionCategories() {
  return (
    <section className="py-6 md:py-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Fashion Categories</h2>
        </div>
        <Link href="/fashion" className="flex items-center text-sm text-purple-600 hover:text-purple-800 font-medium">
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* Mobile Layout - Vertical Cards */}
      <div className="md:hidden px-4 space-y-4">
        {fashionCategories.map((category) => (
          <div key={category.id} className="group">
            <Link href={category.href} className="block">
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="relative h-24 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-85`} />
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{category.icon}</div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{category.title}</h3>
                        <p className="text-xs text-white/90">{category.subtitle}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
            
            {/* Quick Links */}
            <div className="mt-3 px-2">
              <div className="flex flex-wrap gap-2">
                {category.subcategories.slice(0, 4).map((sub) => (
                  <Link
                    key={sub}
                    href={`/search?subcategory=${encodeURIComponent(sub)}`}
                    className="text-xs bg-white text-gray-600 hover:text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-full border border-gray-200 hover:border-purple-200 transition-all duration-200"
                  >
                    {sub}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tablet Layout - 2x2 Grid */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-6 px-4">
        {fashionCategories.map((category) => (
          <div key={category.id} className="group">
            <Link href={category.href} className="block">
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="relative h-32 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-80`} />
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-1">{category.title}</h3>
                    <p className="text-sm text-white/90">{category.subtitle}</p>
                  </div>
                </div>
              </div>
            </Link>
            
            <div className="mt-4 px-2">
              <div className="grid grid-cols-2 gap-2">
                {category.subcategories.slice(0, 6).map((sub) => (
                  <Link
                    key={sub}
                    href={`/search?subcategory=${encodeURIComponent(sub)}`}
                    className="text-xs bg-white text-gray-600 hover:text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg border border-gray-200 hover:border-purple-200 transition-all duration-200 text-center"
                  >
                    {sub}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Layout - 4 Columns */}
      <div className="hidden lg:grid grid-cols-4 gap-6 px-4">
        {fashionCategories.map((category) => (
          <div key={category.id} className="group">
            <Link href={category.href} className="block">
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-75 group-hover:opacity-85 transition-opacity`} />
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{category.title}</h3>
                    <p className="text-sm text-white/90">{category.subtitle}</p>
                  </div>
                </div>
              </div>
            </Link>
            
            <div className="mt-4 px-2">
              <div className="grid grid-cols-2 gap-2">
                {category.subcategories.map((sub) => (
                  <Link
                    key={sub}
                    href={`/search?subcategory=${encodeURIComponent(sub)}`}
                    className="text-xs bg-white text-gray-600 hover:text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg border border-gray-200 hover:border-purple-200 transition-all duration-200 text-center hover:shadow-sm"
                  >
                    {sub}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}