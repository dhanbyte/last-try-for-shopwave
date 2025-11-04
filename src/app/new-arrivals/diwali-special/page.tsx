'use client';

import { useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import { useProductStore } from '@/lib/productStore';
import { NEWARRIVALS_PRODUCTS } from '@/lib/data/newarrivals';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DiwaliSpecialPage() {
  const { products, isLoading } = useProductStore();

  const diwaliProducts = useMemo(() => {
    const allProducts = [...products, ...NEWARRIVALS_PRODUCTS];
    return allProducts.filter(p => 
      p.quantity > 0 && (
        p.subcategory === 'Diwali Special' ||
        p.name.toLowerCase().includes('diwali') ||
        p.name.toLowerCase().includes('light') ||
        p.name.toLowerCase().includes('led') ||
        p.name.toLowerCase().includes('lamp') ||
        p.name.toLowerCase().includes('candle') ||
        p.name.toLowerCase().includes('decoration')
      )
    );
  }, [products]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Diwali Special Collection</h1>
        <p className="text-gray-600">Festival of lights special collection - lights, lamps & decorations</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {diwaliProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {diwaliProducts.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No Diwali special products available at the moment.</p>
        </div>
      )}
    </div>
  );
}