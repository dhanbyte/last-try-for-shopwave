'use client'

import { useEffect, useState } from 'react'
import { Package, Edit, Trash2, RefreshCw } from 'lucide-react'

type VendorProduct = {
  _id: string
  name: string
  description?: string
  images?: string[]
  discountPrice?: number
  price?: number
  originalPrice?: number
  stock?: number | string
  status?: string
}

const formatCurrency = (value: number) => `₹${value.toLocaleString()}`

export default function VendorProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [vendorId, setVendorId] = useState<string | null>(null)

  useEffect(() => {
    const loadVendorData = async () => {
      const isLoggedIn = localStorage.getItem('vendorLoggedIn')
      const vendorDataStr = localStorage.getItem('vendorData')

      if (isLoggedIn === 'true' && vendorDataStr) {
        try {
          const vendorData = JSON.parse(vendorDataStr) as { _id?: string; id?: string }
          const identifier = vendorData._id ?? vendorData.id
          if (identifier) {
            setVendorId(identifier)
            return
          }
        } catch (error) {
          console.error('Error parsing vendor data:', error)
        }
      }

      try {
        const response = await fetch('/api/vendor/session')
        const result = await response.json()
        if (result.success && result.vendor?._id) {
          setVendorId(result.vendor._id as string)
          return
        }
      } catch (error) {
        console.error('Error fetching vendor session:', error)
      }

      window.location.href = '/vendor/login'
    }

    void loadVendorData()
  }, [])

  useEffect(() => {
    if (!vendorId) return
    void fetchProducts(vendorId)
  }, [vendorId])

  const fetchProducts = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/vendor/products?vendorId=${id}`)
      const data = await response.json()
      if (data.success && Array.isArray(data.products)) {
        const typedProducts = data.products.filter(
          (candidate: unknown): candidate is VendorProduct =>
            !!candidate && typeof candidate === 'object' && typeof (candidate as VendorProduct)._id === 'string',
        )
        setProducts(typedProducts)
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const editProduct = (product: VendorProduct) => {
    localStorage.setItem('editProduct', JSON.stringify(product))
    window.location.href = '/vendor/add-product?edit=true'
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      const response = await fetch('/api/vendor/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (response.ok && vendorId) {
        alert('Product deleted successfully')
        await fetchProducts(vendorId)
      }
    } catch (error) {
      alert('Failed to delete product')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-1/4 rounded bg-gray-200" />
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-2 h-4 rounded bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    )
  }

  if (!vendorId) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <Package className="mx-auto mb-4 h-10 w-10 text-gray-300" />
          <p className="text-gray-500">Loading vendor data…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Package className="h-8 w-8" />
          My Products ({products.length})
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => fetchProducts(vendorId)}
            className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <a href="/vendor/add-product" className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Add Product
          </a>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <Package className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900">No products yet</h2>
          <p className="mt-2 text-gray-600">Start by adding your first product.</p>
          <a href="/vendor/add-product" className="mt-4 inline-block rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
            Add Product
          </a>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const salePrice = Number(product.discountPrice ?? product.price ?? 0)
            const compareAtPrice =
              product.originalPrice !== undefined && product.originalPrice !== null
                ? Number(product.originalPrice)
                : salePrice

            return (
              <div key={product._id} className="flex h-full flex-col rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg">
                {product.images?.[0] && (
                  <img src={product.images[0]} alt={product.name} className="mb-4 h-48 w-full rounded-lg object-cover" />
                )}
                <h3 className="mb-2 text-xl font-semibold">{product.name}</h3>
                <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                  {product.description ?? 'No description provided.'}
                </p>
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(salePrice)}</span>
                  {compareAtPrice !== salePrice && (
                    <span className="text-sm text-gray-500 line-through">{formatCurrency(compareAtPrice)}</span>
                  )}
                </div>
                <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
                  <span>Stock: {product.stock ?? 'N/A'}</span>
                  <span
                    className={`rounded-full px-3 py-1 ${
                      product.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : product.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {product.status ?? 'unknown'}
                  </span>
                </div>
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => editProduct(product)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(product._id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
