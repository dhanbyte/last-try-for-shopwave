'use client';

import { useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import { useProductStore } from '@/lib/productStore';
import { NEWARRIVALS_PRODUCTS } from '@/lib/data/newarrivals';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function FragrancePage() {
  const { products, isLoading } = useProductStore();

  const fragranceProducts = useMemo(() => {
    const allProducts = [...products, ...NEWARRIVALS_PRODUCTS];
    return allProducts.filter(p => 
      p.quantity > 0 && (
        p.subcategory === 'Fragrance' ||
        p.name.toLowerCase().includes('fragrance') ||
        p.name.toLowerCase().includes('perfume') ||
        p.name.toLowerCase().includes('scent')
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
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Fragrance Collection</h1>
        <p className="text-gray-600">Premium fragrances and aromatherapy products</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {fragranceProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {fragranceProducts.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No fragrance products available at the moment.</p>
        </div>
      )}
    </div>
  );
}