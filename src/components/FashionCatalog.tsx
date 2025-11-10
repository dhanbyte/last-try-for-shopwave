'use client';

import Link from 'next/link';
import Image from 'next/image';

const fashionCategories = [
  {
    name: 'Formal Shirts',
    subtitle: 'Premium Collection',
    startingPrice: 899,
    discount: 40,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300',
    href: '/search?subcategory=Formal%20Shirts'
  },
  {
    name: 'Casual Shirts',
    subtitle: 'Comfort Wear',
    startingPrice: 699,
    discount: 35,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300',
    href: '/search?subcategory=Casual%20Shirts'
  },
  {
    name: 'T-Shirts',
    subtitle: 'T-Shirts Collection',
    startingPrice: 299,
    discount: 70,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300',
    href: '/search?subcategory=T-Shirts'
  },
  {
    name: 'Polo T-Shirts',
    subtitle: 'Classic Polo',
    startingPrice: 599,
    discount: 45,
    image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300',
    href: '/search?subcategory=Polo%20T-Shirts'
  },
  {
    name: 'Jeans',
    subtitle: 'Premium Jeans',
    startingPrice: 799,
    discount: 60,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300',
    href: '/search?subcategory=Jeans'
  },
  {
    name: 'Trousers',
    subtitle: 'Formal Trousers',
    startingPrice: 999,
    discount: 35,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300',
    href: '/search?subcategory=Trousers'
  },

  {
    name: 'Casual Shoes',
    subtitle: 'Footwear Collection',
    startingPrice: 999,
    discount: 55,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300',
    href: '/search?subcategory=Casual%20Shoes'
  },
  {
    name: 'Sneakers',
    subtitle: 'Footwear Collection',
    startingPrice: 999,
    discount: 55,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300',
    href: '/search?subcategory=Sneakers'
  },
  {
    name: 'Jackets',
    subtitle: 'Winter Collection',
    startingPrice: 2499,
    discount: 30,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300',
    href: '/search?subcategory=Jackets'
  },
  {
    name: 'Hoodies',
    subtitle: 'Casual Wear',
    startingPrice: 1499,
    discount: 45,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300',
    href: '/search?subcategory=Hoodies'
  },
  {
    name: 'Watches',
    subtitle: 'Timepiece Collection',
    startingPrice: 999,
    discount: 60,
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300',
    href: '/search?subcategory=Watches'
  },
  {
    name: 'Dresses',
    subtitle: 'Beautiful Dresses',
    startingPrice: 599,
    discount: 65,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300',
    href: '/search?subcategory=Dresses'
  }
];

export default function FashionCatalog() {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Fashion Collection</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {fashionCategories.map((category) => (
          <Link 
            key={category.name} 
            href={category.href}
            className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            <div className="relative aspect-square overflow-hidden">
              <Image 
                src={category.image} 
                alt={category.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />

            </div>
            
            <div className="p-3">
              <div className="text-center mb-2">
                <div className="text-red-600 font-bold text-xs mb-1">
                  {category.name} Deal
                </div>
                <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded inline-block mb-1">
                  {category.discount}% OFF
                </div>
              </div>
              <h3 className="font-semibold text-sm text-gray-800 mb-1 text-center">
                {category.subtitle}
              </h3>
              <div className="text-center">
                <span className="text-green-600 font-bold text-sm">
                  Starting ₹{category.startingPrice}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}