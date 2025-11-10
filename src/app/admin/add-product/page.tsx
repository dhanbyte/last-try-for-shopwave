'use client'

import Link from 'next/link'
import { ChangeEvent, FormEvent, useMemo, useState } from 'react'

type Category =
  | 'Tech'
  | 'Home'
  | 'Fashion'
  | 'Ayurvedic'
  | 'Beauty'
  | 'Groceries'
  | 'Pooja'
  | 'Food & Drinks'

interface ProductFormState {
  name: string
  category: Category
  subcategory: string
  tertiaryCategory: string
  price: string
  description: string
  image: string
  stock: string
}

const categoryOptions: Category[] = [
  'Tech',
  'Home',
  'Fashion',
  'Ayurvedic',
  'Beauty',
  'Groceries',
  'Pooja',
  'Food & Drinks'
]

const subcategoryMap: Partial<Record<Category, string[]>> = {
  Fashion: ['Men', 'Women', 'Kids', 'Accessories'],
  Tech: ['Mobiles', 'Laptops', 'Audio', 'Accessories'],
  Home: ['Decor', 'Lighting', 'Kitchenware', 'Appliances']
}

const tertiaryMap: Record<string, string[]> = {
  Men: [
    'Formal-Shirts',
    'Casual-Shirts',
    'T-Shirts',
    'Polo-T-Shirts',
    'Jeans',
    'Trousers',
    'Formal-Shoes',
    'Casual-Shoes',
    'Sneakers',
    'Jackets',
    'Hoodies',
    'Watches'
  ],
  Women: [
    'Dresses',
    'Sarees',
    'Kurtis',
    'Tops',
    'Jeans',
    'Leggings',
    'Skirts',
    'Heels',
    'Flats',
    'Sandals',
    'Handbags',
    'Jewelry'
  ],
  Kids: [
    'Boys-T-Shirts',
    'Girls-Dresses',
    'Boys-Shirts',
    'Girls-Tops',
    'Kids-Jeans',
    'Kids-Shorts',
    'Kids-Shoes',
    'School-Uniforms',
    'Party-Wear',
    'Sleepwear',
    'Winter-Wear',
    'Accessories'
  ],
  Accessories: [
    'Watches',
    'Sunglasses',
    'Belts',
    'Wallets',
    'Bags',
    'Jewelry',
    'Caps-Hats',
    'Scarves',
    'Ties',
    'Hair-Accessories',
    'Phone-Cases',
    'Perfumes'
  ]
}

const initialState: ProductFormState = {
  name: '',
  category: 'Tech',
  subcategory: '',
  tertiaryCategory: '',
  price: '',
  description: '',
  image: '',
  stock: ''
}

export default function AddProductPage() {
  const [formData, setFormData] = useState<ProductFormState>({ ...initialState })
  const [loading, setLoading] = useState(false)

  const availableSubcategories = useMemo(
    () => subcategoryMap[formData.category] ?? [],
    [formData.category]
  )
  const availableTertiary = useMemo(
    () => (formData.subcategory ? tertiaryMap[formData.subcategory] ?? [] : []),
    [formData.subcategory]
  )

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target

    setFormData((prev) => {
      if (name === 'category') {
        return {
          ...prev,
          category: value as Category,
          subcategory: '',
          tertiaryCategory: ''
        }
      }

      if (name === 'subcategory') {
        return {
          ...prev,
          subcategory: value,
          tertiaryCategory: ''
        }
      }

      return {
        ...prev,
        [name]: value
      }
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    try {
      const parsedPrice = Number.parseFloat(formData.price)
      const parsedStock = Number.parseInt(formData.stock, 10)

      if (Number.isNaN(parsedPrice) || Number.isNaN(parsedStock)) {
        alert('Price and stock must be valid numbers')
        return
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          subcategory: formData.subcategory,
          tertiaryCategory: formData.tertiaryCategory,
          price: parsedPrice,
          description: formData.description,
          image: formData.image,
          stock: parsedStock
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('Product added successfully!')
        setFormData({ ...initialState })
      } else {
        alert('Error: ' + (data.error || 'Unknown error occurred'))
      }
    } catch (error) {
      if (error instanceof Error) {
        alert('Network error: ' + error.message)
      } else {
        alert('Network error: unknown')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products">
          <button className="text-gray-600 hover:text-gray-800">{'< Back'}</button>
        </Link>
        <h1 className="text-3xl font-bold">Add New Product</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter product name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subcategory *</label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Subcategory</option>
                {availableSubcategories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {formData.category === 'Fashion' && (
              <div>
                <label className="block text-sm font-medium mb-2">Product Type *</label>
                <select
                  name="tertiaryCategory"
                  value={formData.tertiaryCategory}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Type</option>
                  {availableTertiary.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price (INR)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stock Quantity</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Image URL</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter product description"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
            <Link href="/admin/products">
              <button
                type="button"
                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
