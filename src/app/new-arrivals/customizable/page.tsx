'use client';

import { useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import { useProductStore } from '@/lib/productStore';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function CustomizablePage() {
  const { products, isLoading } = useProductStore();

  const customizableProducts = useMemo(() => {
    return products.filter(p => 
      p.quantity > 0 && p.category === 'Customizable'
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
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Customizable Products</h1>
        <p className="text-gray-600">Personalize your favorite items with custom designs</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {customizableProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {customizableProducts.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No customizable products available at the moment.</p>
        </div>
      )}
    </div>
  );
}