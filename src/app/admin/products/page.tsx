'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface RawProduct {
  _id?: string
  id?: string
  name?: string
  category?: string
  mainCategory?: string
  images?: string[]
  image?: string
  price?: unknown
  brand?: string
  vendorId?: string
  quantity?: number
  stock?: number
  status?: string
}

interface ProductsResponse {
  products?: RawProduct[]
}

interface AdminProduct {
  id: string
  name: string
  category?: string
  imageUrl: string
  price: number
  brand?: string
  vendorId?: string
  stock: number
  status?: string
  isVendorProduct: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const [regularRes, vendorRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/vendor-products')
      ])

      const regularData: ProductsResponse = await regularRes.json()
      const vendorData: ProductsResponse = await vendorRes.json()

      const regularProducts = (regularData.products ?? []).map((product) =>
        normalizeProduct(product, false)
      )
      const vendorProducts = (vendorData.products ?? []).map((product) =>
        normalizeProduct(product, true)
      )

      setProducts([...regularProducts, ...vendorProducts])
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching products:', error.message)
      } else {
        console.error('Error fetching products:', error)
      }
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const updateProductStatus = async (productId: string, status: string, isVendorProduct: boolean) => {
    try {
      const endpoint = isVendorProduct ? '/api/admin/vendor-products' : '/api/admin/products'
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, status })
      })

      if (response.ok) {
        alert(`Product status updated to ${status}`)
        await fetchProducts()
      } else {
        alert('Failed to update product status')
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`Failed to update product status: ${error.message}`)
      } else {
        alert('Failed to update product status')
      }
    }
  }

  const deleteProduct = async (productId: string, isVendorProduct: boolean) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const endpoint = isVendorProduct ? '/api/admin/vendor-products' : '/api/admin/products'
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })

      if (response.ok) {
        alert('Product deleted successfully')
        await fetchProducts()
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`Failed to delete product: ${error.message}`)
      } else {
        alert('Failed to delete product')
      }
    }
  }

  const populateProducts = async () => {
    if (!confirm('This will populate the database with products from JSON files (excluding fashion). Continue?')) {
      return
    }

    try {
      const response = await fetch('/api/admin/populate-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`Products populated successfully! Inserted: ${data.stats.inserted}, Updated: ${data.stats.updated}, Errors: ${data.stats.errors}`)
        await fetchProducts()
      } else {
        alert(`Failed to populate products: ${data.error}`)
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`Failed to populate products: ${error.message}`)
      } else {
        alert('Failed to populate products')
      }
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-2">
          <button 
            onClick={populateProducts}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Populate Products
          </button>
          <Link href="/admin/add-product">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              + Add Product
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Product List</h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No products found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        {product.isVendorProduct && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            Vendor Product
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{product.category ?? 'Uncategorized'}</p>
                      <p className="text-green-600 font-medium">
                        {formatCurrency(product.price)}
                      </p>
                      {product.brand && <p className="text-sm text-gray-500">{product.brand}</p>}
                      {product.vendorId && (
                        <p className="text-xs text-gray-400">Vendor ID: {product.vendorId}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        product.stock > 10 ? 'text-green-600' : 'text-orange-600'
                      }`}
                    >
                      Stock: {product.stock}
                    </p>

                    {product.isVendorProduct && (
                      <div className="mt-2 mb-2">
                        <select
                          value={product.status ?? 'pending'}
                          onChange={(event) =>
                            updateProductStatus(product.id, event.target.value, true)
                          }
                          className={`px-2 py-1 rounded text-xs border ${
                            product.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : product.status === 'blocked'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          <option value="pending">pending</option>
                          <option value="active">approved</option>
                          <option value="blocked">blocked</option>
                        </select>
                      </div>
                    )}

                    <div className="flex gap-2 mt-2 justify-end">
                      <button className="bg-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-200">
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id, product.isVendorProduct)}
                        className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function normalizeProduct(product: RawProduct, isVendorProduct: boolean): AdminProduct {
  const id = String(
    product._id ||
    product.id ||
    crypto.randomUUID()
  )

  const images = Array.isArray(product.images) ? product.images : []
  const imageUrl = images[0] ?? product.image ?? '/images/placeholder.jpg'

  const price = resolvePrice(product.price)
  const stock = resolveStock(product.stock, product.quantity)

  return {
    id,
    name: product.name ?? 'Untitled product',
    category: product.category ?? product.mainCategory,
    imageUrl,
    price,
    brand: product.brand,
    vendorId: product.vendorId,
    stock,
    status: product.status,
    isVendorProduct
  }
}

function resolvePrice(value: unknown): number {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'object' && value !== null) {
    const priceObject = value as { discounted?: number; original?: number }
    if (typeof priceObject.discounted === 'number') {
      return priceObject.discounted
    }
    if (typeof priceObject.original === 'number') {
      return priceObject.original
    }
  }

  return 0
}

function resolveStock(stock?: number, quantity?: number): number {
  if (typeof stock === 'number') {
    return stock
  }
  if (typeof quantity === 'number') {
    return quantity
  }
  return 0
}

function formatCurrency(value: number) {
  return `INR ${value.toLocaleString()}`
}
