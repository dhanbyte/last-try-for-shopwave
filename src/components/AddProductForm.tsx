'use client';

import { useState } from 'react';
import { CATEGORIES, CategoryType } from '@/lib/data/categories';

export default function AddProductForm() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | ''>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [productName, setProductName] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');

  const handleCategoryChange = (category: CategoryType | '') => {
    setSelectedCategory(category);
    setSelectedSubcategory(''); // Reset subcategory when category changes
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName || !selectedCategory || !selectedSubcategory || !originalPrice) {
      alert('कृपया सभी fields भरें');
      return;
    }

    const newProduct = {
      name: productName,
      category: selectedCategory,
      subcategory: selectedSubcategory,
      originalPrice: parseFloat(originalPrice)
    };

    console.log('New Product:', newProduct);
    alert('Product successfully added!');
    
    // Reset form
    setProductName('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setOriginalPrice('');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Product Name *
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter product name"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Category *
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value as CategoryType | '')}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select Category</option>
            {Object.keys(CATEGORIES).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory - Only show when category is selected */}
        {selectedCategory && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Subcategory *
            </label>
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Subcategory</option>
              {CATEGORIES[selectedCategory].map((subcategory) => (
                <option key={subcategory} value={subcategory}>
                  {subcategory}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Original Price */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Original Price *
          </label>
          <input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter price in ₹"
            min="0"
            step="0.01"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Add Product
        </button>
      </form>

      {/* Selected Values Display */}
      {selectedCategory && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">Selected:</h3>
          <p><strong>Category:</strong> {selectedCategory}</p>
          {selectedSubcategory && (
            <p><strong>Subcategory:</strong> {selectedSubcategory}</p>
          )}
        </div>
      )}
    </div>
  );
}