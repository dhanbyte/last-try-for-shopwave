'use client';

import { useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import { useProductStore } from '@/lib/productStore';
import { NEWARRIVALS_PRODUCTS } from '@/lib/data/newarrivals';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function BestSellingPage() {
  const { products, isLoading } = useProductStore();

  const bestSellingProducts = useMemo(() => {
    const allProducts = [...products, ...NEWARRIVALS_PRODUCTS];
    return allProducts.filter(p => 
      p.quantity > 0 && (
        p.subcategory === 'Best Selling' ||
        (p.ratings?.average || 0) >= 4.0 ||
        (p.ratings?.count || 0) >= 15
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
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Best Selling Products</h1>
        <p className="text-gray-600">Most loved products by our customers</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {bestSellingProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {bestSellingProducts.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No best selling products available at the moment.</p>
        </div>
      )}
    </div>
  );
}