'use client';

import Link from 'next/link';
import Image from 'next/image';

const fashionCategories = [
  {
    title: "Men's Fashion",
    subtitle: "Shirts, Jeans, T-Shirts & More",
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    href: '/search?category=Men',
    subcategories: [
      { name: 'Formal Shirts', href: '/search?subcategory=Formal%20Shirts' },
      { name: 'Casual Shirts', href: '/search?subcategory=Casual%20Shirts' },
      { name: 'T-Shirts', href: '/search?subcategory=T-Shirts' },
      { name: 'Polo T-Shirts', href: '/search?subcategory=Polo%20T-Shirts' },
      { name: 'Jeans', href: '/search?subcategory=Jeans' },
      { name: 'Trousers', href: '/search?subcategory=Trousers' },
      { name: 'Formal Shoes', href: '/search?subcategory=Formal%20Shoes' },
      { name: 'Casual Shoes', href: '/search?subcategory=Casual%20Shoes' },
      { name: 'Sneakers', href: '/search?subcategory=Sneakers' },
      { name: 'Jackets', href: '/search?subcategory=Jackets' },
      { name: 'Hoodies', href: '/search?subcategory=Hoodies' },
      { name: 'Watches', href: '/search?subcategory=Watches' }
    ]
  },
  {
    title: "Women's Fashion",
    subtitle: "Dresses, Sarees, Kurtis & More",
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
    href: '/search?category=Women',
    subcategories: [
      { name: 'Dresses', href: '/search?subcategory=Dresses' },
      { name: 'Sarees', href: '/search?subcategory=Sarees' },
      { name: 'Kurtis', href: '/search?subcategory=Kurtis' },
      { name: 'Tops', href: '/search?subcategory=Tops' },
      { name: 'Jeans', href: '/search?subcategory=Women%20Jeans' },
      { name: 'Leggings', href: '/search?subcategory=Leggings' },
      { name: 'Skirts', href: '/search?subcategory=Skirts' },
      { name: 'Heels', href: '/search?subcategory=Heels' },
      { name: 'Flats', href: '/search?subcategory=Flats' },
      { name: 'Sandals', href: '/search?subcategory=Sandals' },
      { name: 'Handbags', href: '/search?subcategory=Handbags' },
      { name: 'Jewelry', href: '/search?subcategory=Jewelry' }
    ]
  },
  {
    title: "Kids Fashion",
    subtitle: "Cute & Comfortable Clothing",
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400',
    href: '/search?category=Kids',
    subcategories: [
      { name: 'Boys T-Shirts', href: '/search?subcategory=Boys%20T-Shirts' },
      { name: 'Girls Dresses', href: '/search?subcategory=Girls%20Dresses' },
      { name: 'Boys Shirts', href: '/search?subcategory=Boys%20Shirts' },
      { name: 'Girls Tops', href: '/search?subcategory=Girls%20Tops' },
      { name: 'Kids Jeans', href: '/search?subcategory=Kids%20Jeans' },
      { name: 'Kids Shorts', href: '/search?subcategory=Kids%20Shorts' },
      { name: 'Kids Shoes', href: '/search?subcategory=Kids%20Shoes' },
      { name: 'School Uniforms', href: '/search?subcategory=School%20Uniforms' },
      { name: 'Party Wear', href: '/search?subcategory=Kids%20Party%20Wear' },
      { name: 'Sleepwear', href: '/search?subcategory=Kids%20Sleepwear' },
      { name: 'Winter Wear', href: '/search?subcategory=Kids%20Winter%20Wear' },
      { name: 'Accessories', href: '/search?subcategory=Kids%20Accessories' }
    ]
  },
  {
    title: "Fashion Accessories",
    subtitle: "Complete Your Look",
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
    href: '/search?category=Accessories',
    subcategories: [
      { name: 'Watches', href: '/search?subcategory=Watches' },
      { name: 'Sunglasses', href: '/search?subcategory=Sunglasses' },
      { name: 'Belts', href: '/search?subcategory=Belts' },
      { name: 'Wallets', href: '/search?subcategory=Wallets' },
      { name: 'Bags', href: '/search?subcategory=Bags' },
      { name: 'Jewelry', href: '/search?subcategory=Jewelry' },
      { name: 'Caps & Hats', href: '/search?subcategory=Caps' },
      { name: 'Scarves', href: '/search?subcategory=Scarves' },
      { name: 'Ties', href: '/search?subcategory=Ties' },
      { name: 'Hair Accessories', href: '/search?subcategory=Hair%20Accessories' },
      { name: 'Phone Cases', href: '/search?subcategory=Phone%20Cases' },
      { name: 'Perfumes', href: '/search?subcategory=Perfumes' }
    ]
  }
];

export default function FashionCategories() {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Fashion Categories</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {fashionCategories.map((category) => (
          <div key={category.title} className="group">
            <Link 
              href={category.href}
              className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden mb-4"
            >
              <div className="relative h-48 overflow-hidden">
                <Image 
                  src={category.image} 
                  alt={category.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                  <h3 className="text-xl font-bold mb-2 text-center">
                    {category.title}
                  </h3>
                  <p className="text-sm text-center opacity-90">
                    {category.subtitle}
                  </p>
                </div>
              </div>
            </Link>
            
            <div className="grid grid-cols-2 gap-2">
              {category.subcategories.map((sub) => (
                <Link
                  key={sub.name}
                  href={sub.href}
                  className="text-xs text-gray-600 hover:text-blue-600 hover:underline transition-colors p-1 text-center"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}