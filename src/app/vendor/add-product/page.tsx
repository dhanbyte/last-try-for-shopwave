'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Package, Save, Plus, X, Upload, Info } from 'lucide-react'

import { useProductStore } from '@/lib/productStore'

type BaseCategory = 'tech' | 'home' | 'fashion' | 'newArrivals' | 'customizable'
type ProductCategory = '' | BaseCategory

type DraftProduct = {
  name: string
  category: ProductCategory
  subcategory: string
  tertiaryCategory: string
  originalPrice: string
  discountPrice: string
  description: string
  stock: string
  length: string
  width: string
  height: string
  weight: string
  images: File[]
  imageUrls: string[]
  uploadingImages: boolean
}

type VendorProfile = {
  _id: string
  brandName?: string
  businessName?: string
  email?: string
}

type UploadResponse = {
  success: boolean
  url?: string
  message?: string
}

// Static fashion subcategories (keep as hardcoded)
const FASHION_SUBCATEGORIES = ['Men', 'Women', 'Kids', 'Accessories']

const FASHION_TERTIARY: Record<string, string[]> = {
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
    'Watches',
  ],
  Women: [
    'Lehengas',
    'Gowns',
    'Ethnic-wear',
    'Winterwear',
    'Dresses',
    'Sarees',
    'Kurtis',
    'Tops',
    'Jeans',
    'Top & Bottom Wear',
    'Handbags',
    'Jewelry',
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
    'Accessories',
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
    'Perfumes',
  ],
}

const createEmptyProduct = (): DraftProduct => ({
  name: '',
  category: '',
  subcategory: '',
  tertiaryCategory: '',
  originalPrice: '',
  discountPrice: '',
  description: '',
  stock: '',
  length: '',
  width: '',
  height: '',
  weight: '',
  images: [],
  imageUrls: [],
  uploadingImages: false,
})

const normaliseCategory = (value: string | undefined): ProductCategory => {
  if (!value) return ''
  switch (value) {
    case 'Tech':
      return 'tech'
    case 'Home':
      return 'home'
    case 'Fashion':
      return 'fashion'
    case 'New Arrivals':
      return 'newArrivals'
    case 'Customizable':
      return 'customizable'
    default:
      return value as ProductCategory
  }
}

const canonicalCategory = (category: ProductCategory): string => {
  switch (category) {
    case 'tech':
      return 'Tech'
    case 'home':
      return 'Home'
    case 'fashion':
      return 'Fashion'
    case 'newArrivals':
      return 'New Arrivals'
    case 'customizable':
      return 'Customizable'
    default:
      return category
  }
}

const coerceImageUrls = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is string => typeof entry === 'string')
}

export default function AddProductPage() {
  const { forceRefresh } = useProductStore()

  const [products, setProducts] = useState<DraftProduct[]>(() => [createEmptyProduct()])
  const [activeProductIndex, setActiveProductIndex] = useState(0)
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null)
  const [vendorLoading, setVendorLoading] = useState(true)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Fetch subcategories from database for non-fashion categories
  const [categorySubcategories, setCategorySubcategories] = useState<Record<BaseCategory, string[]>>({
    tech: [],
    home: [],
    fashion: FASHION_SUBCATEGORIES,
    newArrivals: [],
    customizable: [],
  })

  const categoryOptions = useMemo(() => ({
    ...categorySubcategories,
    fashion: FASHION_SUBCATEGORIES // Always use hardcoded fashion subcategories
  }), [categorySubcategories])
  
  const refreshCategories = async () => {
    try {
      // Force clear browser cache
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }
      
      const response = await fetch(`/api/categories?t=${Date.now()}&v=${Math.random()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      const data = await response.json()
      if (data.success && data.categories) {
        const subcategories: Record<BaseCategory, string[]> = {
          tech: [],
          home: [],
          fashion: FASHION_SUBCATEGORIES,
          newArrivals: [],
          customizable: [],
        }
        
        data.categories.forEach((category: any) => {
          const categoryName = category.name.toLowerCase()
          let categoryKey: BaseCategory | null = null
          
          if (categoryName === 'tech') {
            categoryKey = 'tech'
          } else if (categoryName === 'home' || categoryName === 'home tech') {
            categoryKey = 'home'
          } else if (categoryName === 'new arrivals') {
            categoryKey = 'newArrivals'
          } else if (categoryName === 'customizable') {
            categoryKey = 'customizable'
          }
          
          if (categoryKey && categoryKey !== 'fashion') {
            subcategories[categoryKey] = category.subcategories || []
          }
        })
        
        setCategorySubcategories(subcategories)
        // Clear localStorage cache
        localStorage.removeItem('categoryCache')
        localStorage.setItem('categoryCache', JSON.stringify(subcategories))
        alert('Categories refreshed successfully!')
      }
    } catch (error) {
      console.error('Failed to refresh categories:', error)
      alert('Failed to refresh categories')
    }
  }

  const setProduct = useCallback(
    (index: number, updater: (draft: DraftProduct) => DraftProduct) => {
      setProducts((prev) => {
        const next = [...prev]
        next[index] = updater({ ...next[index] })
        return next
      })
    },
    [],
  )

  const addAnotherProduct = () => {
    setProducts((prev) => [...prev, createEmptyProduct()])
    setActiveProductIndex((prevIndex) => prevIndex + 1)
  }

  const removeProduct = (index: number) => {
    setProducts((prev) => {
      if (prev.length <= 1) {
        return prev
      }
      const next = prev.filter((_, i) => i !== index)
      setActiveProductIndex((prevIndex) => Math.max(0, prevIndex === index ? prevIndex - 1 : prevIndex))
      return next
    })
  }

  const prefillFromStoredProduct = (raw: unknown) => {
    if (!raw || typeof raw !== 'object') return
    const product = raw as Record<string, unknown>
    const normalised: DraftProduct = {
      ...createEmptyProduct(),
      name: typeof product.name === 'string' ? product.name : '',
      category: normaliseCategory(product.category as string),
      subcategory: typeof product.subcategory === 'string' ? product.subcategory : '',
      tertiaryCategory: typeof product.tertiaryCategory === 'string' ? product.tertiaryCategory : '',
      originalPrice:
        typeof product.originalPrice === 'number'
          ? product.originalPrice.toString()
          : typeof product.price === 'number'
          ? product.price.toString()
          : '',
      discountPrice:
        typeof product.discountPrice === 'number'
          ? product.discountPrice.toString()
          : typeof product.price === 'number'
          ? product.price.toString()
          : '',
      description: typeof product.description === 'string' ? product.description : '',
      stock:
        typeof product.stock === 'number'
          ? product.stock.toString()
          : typeof product.stock === 'string'
          ? product.stock
          : '',
      length:
        typeof product.length === 'number'
          ? product.length.toString()
          : typeof product.length === 'string'
          ? product.length
          : '',
      width:
        typeof product.width === 'number'
          ? product.width.toString()
          : typeof product.width === 'string'
          ? product.width
          : '',
      height:
        typeof product.height === 'number'
          ? product.height.toString()
          : typeof product.height === 'string'
          ? product.height
          : '',
      weight:
        typeof product.weight === 'number'
          ? product.weight.toString()
          : typeof product.weight === 'string'
          ? product.weight
          : '',
      imageUrls: coerceImageUrls(product.images),
    }
    setProducts([normalised])
  }

  useEffect(() => {
    const loadVendorProfile = async () => {
      try {
        const localVendorFlag = localStorage.getItem('vendorLoggedIn')
        const storedVendor = localStorage.getItem('vendorData')

        if (localVendorFlag === 'true' && storedVendor) {
          const parsed = JSON.parse(storedVendor) as VendorProfile
          if (parsed?._id) {
            setVendorProfile(parsed)
            setVendorLoading(false)
            return
          }
        }

        const sessionResponse = await fetch('/api/vendor/session', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const session = await sessionResponse.json()
        if (session.success && session.vendor?._id) {
          setVendorProfile(session.vendor as VendorProfile)
        } else {
          window.location.href = '/vendor/login'
        }
      } catch (error) {
        console.error('Failed to load vendor session:', error)
        window.location.href = '/vendor/login'
      } finally {
        setVendorLoading(false)
      }
    }

    const loadCategorySubcategories = async () => {
      try {
        // First try to load from localStorage
        const cached = localStorage.getItem('categoryCache')
        if (cached) {
          try {
            const cachedData = JSON.parse(cached)
            setCategorySubcategories(cachedData)
            console.log('Loaded from cache:', cachedData)
          } catch (e) {
            localStorage.removeItem('categoryCache')
          }
        }
        
        // Clear any cached data first
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          await Promise.all(cacheNames.map(name => caches.delete(name)))
        }
        
        const response = await fetch(`/api/categories?t=${Date.now()}&v=${Math.random()}`, {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        const data = await response.json()
        if (data.success && data.categories) {
          const subcategories: Record<BaseCategory, string[]> = {
            tech: [],
            home: [],
            fashion: FASHION_SUBCATEGORIES,
            newArrivals: [],
            customizable: [],
          }
          
          data.categories.forEach((category: any) => {
            const categoryName = category.name.toLowerCase()
            let categoryKey: BaseCategory | null = null
            
            if (categoryName === 'tech') {
              categoryKey = 'tech'
            } else if (categoryName === 'home' || categoryName === 'home tech') {
              categoryKey = 'home'
            } else if (categoryName === 'new arrivals') {
              categoryKey = 'newArrivals'
            } else if (categoryName === 'customizable') {
              categoryKey = 'customizable'
            }
            
            if (categoryKey && categoryKey !== 'fashion') {
              subcategories[categoryKey] = category.subcategories || []
            }
          })
          
          setCategorySubcategories(subcategories)
          // Cache in localStorage
          localStorage.setItem('categoryCache', JSON.stringify(subcategories))
          console.log('Loaded subcategories:', subcategories)
        }
      } catch (error) {
        console.error('Failed to load categories:', error)
        setCategorySubcategories({
          tech: ['Wearable Devices', 'Headphones', 'Watches', 'VR Headsets', 'Computer Accessories', 'Mobile Accessories'],
          home: ['Kitchen Storage & Container', 'Water Jugs', 'Kitchen Basket & Bowl', 'Glassware', 'Kitchen Tools'],
          fashion: FASHION_SUBCATEGORIES,
          newArrivals: ['Shopwave', 'Just Arrived', 'Best Seller', 'Latest Gadgets', 'Trending Products'],
          customizable: ['Drinkware', 'Kitchen Items', 'Accessories', 'Jewelry', 'Personalized Gifts'],
        })
      }
    }

    const hydrateEditState = () => {
      const params = new URLSearchParams(window.location.search)
      const edit = params.get('edit')
      if (edit) {
        const cached = localStorage.getItem('editProduct')
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            prefillFromStoredProduct(parsed)
            if (parsed && typeof parsed === 'object' && typeof parsed._id === 'string') {
              setEditingProductId(parsed._id)
            }
          } catch (error) {
            console.warn('Unable to parse edit product payload:', error)
          } finally {
            localStorage.removeItem('editProduct')
          }
        }
      }
    }

    loadVendorProfile()
    loadCategorySubcategories()
    hydrateEditState()
  }, [])

  const currentProduct = products[activeProductIndex]

  const handleFieldChange = <K extends keyof DraftProduct>(field: K, value: DraftProduct[K]) => {
    setProduct(activeProductIndex, (draft) => ({ ...draft, [field]: value }))
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return

    const selected = Array.from(files)
    
    // Validate files
    const validFiles = selected.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`)
        return false
      }
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image.`)
        return false
      }
      return true
    })
    
    if (!validFiles.length) return
    
    // Check total image limit
    const currentCount = currentProduct.imageUrls.length
    if (currentCount + validFiles.length > 10) {
      alert(`You can only upload up to 10 images. You have ${currentCount} images already.`)
      return
    }

    setProduct(activeProductIndex, (draft) => ({ ...draft, images: [...draft.images, ...validFiles], uploadingImages: true }))

    const uploadedUrls: string[] = [...currentProduct.imageUrls]
    try {
      for (const image of validFiles) {
        const formData = new FormData()
        formData.append('file', image)
        formData.append('fileName', `product-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`)
        formData.append('folder', '/vendor-products')

        const res = await fetch('/api/imagekit/upload', { 
          method: 'POST', 
          body: formData,
          credentials: 'include'
        })
        const payload = (await res.json()) as UploadResponse
        if (payload.success && payload.url) {
          uploadedUrls.push(payload.url)
        } else {
          throw new Error(payload.message || 'Upload failed')
        }
      }

      setProduct(activeProductIndex, (draft) => ({
        ...draft,
        imageUrls: uploadedUrls,
        uploadingImages: false,
      }))
    } catch (error) {
      console.error('Image upload failed:', error)
      alert(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setProduct(activeProductIndex, (draft) => ({ ...draft, uploadingImages: false }))
    }
  }

  const replaceImage = async (imageIndex: number, file: File) => {
    setProduct(activeProductIndex, (draft) => {
      const nextFiles = [...draft.images]
      nextFiles[imageIndex] = file
      return { ...draft, images: nextFiles, uploadingImages: true }
    })

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileName', `product-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`)
      formData.append('folder', '/vendor-products')

      const res = await fetch('/api/imagekit/upload', { 
        method: 'POST', 
        body: formData,
        credentials: 'include'
      })
      const payload = (await res.json()) as UploadResponse
      if (payload.success && payload.url) {
        setProduct(activeProductIndex, (draft) => {
          const nextUrls = [...draft.imageUrls]
          nextUrls[imageIndex] = payload.url as string
          return { ...draft, imageUrls: nextUrls, uploadingImages: false }
        })
      } else {
        throw new Error(payload.message ?? 'Upload failed')
      }
    } catch (error) {
      console.error('Image replacement failed:', error)
      setProduct(activeProductIndex, (draft) => ({ ...draft, uploadingImages: false }))
    }
  }

  const uploadImagesInBackground = async (productId: string, images: File[]) => {
    try {
      const uploaded: string[] = []
      for (const image of images) {
        const formData = new FormData()
        formData.append('file', image)
        formData.append('fileName', `product-${productId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`)
        formData.append('folder', '/vendor-products')
        const res = await fetch('/api/imagekit/upload', { 
          method: 'POST', 
          body: formData,
          credentials: 'include'
        })
        const payload = (await res.json()) as UploadResponse
        if (payload.success && payload.url) {
          uploaded.push(payload.url)
        }
      }

      if (uploaded.length) {
        await fetch('/api/vendor/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, images: uploaded, updateImagesOnly: true }),
        })
      }
    } catch (error) {
      console.error('Background image upload failed:', error)
    }
  }

  const validateProduct = (product: DraftProduct) => {
    const requiredFields = [
      product.name,
      product.category,
      product.subcategory,
      product.originalPrice,
      product.discountPrice,
      product.stock,
      product.length,
      product.width,
      product.height,
      product.weight,
    ]

    const hasImages = product.images.length > 0 || product.imageUrls.length > 0
    return requiredFields.every(Boolean) && hasImages
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!vendorProfile?._id) {
      alert('Vendor profile not loaded yet.')
      return
    }

    if (!products.every(validateProduct)) {
      alert(
        'Please complete all required fields (name, categories, pricing, stock, dimensions, weight) and ensure at least one image is provided for each product.',
      )
      return
    }

    setIsSaving(true)
    try {
      for (const draft of products) {
        const payload = {
          vendorId: vendorProfile._id,
          name: draft.name,
          brand: vendorProfile.brandName || vendorProfile.businessName || 'Unknown Brand',
          category: canonicalCategory(draft.category),
          subcategory: draft.subcategory,
          tertiaryCategory: draft.tertiaryCategory || undefined,
          description: draft.description,
          images:
            draft.imageUrls.length > 0
              ? draft.imageUrls
              : draft.images.map((_, index) => `placeholder-${Date.now()}-${index}`),
          price: Number(draft.discountPrice),
          originalPrice: Number(draft.originalPrice),
          discountPrice: Number(draft.discountPrice),
          stock: Number(draft.stock),
          length: Number(draft.length),
          width: Number(draft.width),
          height: Number(draft.height),
          weight: Number(draft.weight),
          pendingImages: draft.images.length > 0 && draft.imageUrls.length === 0,
        }

        const response = await fetch('/api/vendor/products', {
          method: editingProductId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingProductId ? { ...payload, productId: editingProductId } : payload),
        })

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.message ?? `Failed to save product "${draft.name}"`)
        }

        if (draft.images.length && draft.imageUrls.length === 0 && typeof result.productId === 'string') {
          uploadImagesInBackground(result.productId, draft.images).catch((error) =>
            console.error('Deferred upload failed', error),
          )
        }
      }

      if (typeof forceRefresh === 'function') {
        await forceRefresh()
      }

      alert(`${products.length} product(s) ${editingProductId ? 'updated' : 'added'} successfully!`)

      if (editingProductId) {
        window.location.href = '/vendor/products'
      } else {
        setProducts([createEmptyProduct()])
        setActiveProductIndex(0)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to save products: ${message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center gap-3">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Package className="h-8 w-8" />
            {editingProductId ? 'Edit Product' : `Add New Products (${products.length})`}
          </h1>
          {vendorLoading && (
            <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-600">Loading vendor profile…</span>
          )}
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex gap-2 overflow-x-auto">
              {products.map((_, index) => (
                <button
                  key={`product-tab-${index}`}
                  type="button"
                  onClick={() => setActiveProductIndex(index)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 ${
                    activeProductIndex === index ? 'bg-blue-600 text-white' : 'bg-gray-100'
                  }`}
                >
                  Product {index + 1}
                  {products.length > 1 && (
                    <X
                      className="h-4 w-4"
                      onClick={(event) => {
                        event.stopPropagation()
                        removeProduct(index)
                      }}
                    />
                  )}
                </button>
              ))}
              <button
                type="button"
                onClick={addAnotherProduct}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium">
                  Product Name *
                  <input
                    type="text"
                    value={currentProduct.name}
                    onChange={(event) => handleFieldChange('name', event.target.value)}
                    className="rounded-lg border px-3 py-2"
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium">
                  Category *
                  <select
                    value={currentProduct.category}
                    onChange={(event) => {
                      handleFieldChange('category', event.target.value as ProductCategory)
                      handleFieldChange('subcategory', '')
                      handleFieldChange('tertiaryCategory', '')
                    }}
                    className="rounded-lg border px-3 py-2"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="tech">Tech</option>
                    <option value="home">Home Decor</option>
                    <option value="fashion">Fashion</option>
                    <option value="newArrivals">New Arrivals</option>
                    <option value="customizable">Customizable</option>
                  </select>
                </label>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Subcategory *</label>
                    <button
                      type="button"
                      onClick={refreshCategories}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                    >
                      Refresh
                    </button>
                  </div>
                  <select
                    value={currentProduct.subcategory}
                    onChange={(event) => {
                      handleFieldChange('subcategory', event.target.value)
                      handleFieldChange('tertiaryCategory', '')
                    }}
                    className="rounded-lg border px-3 py-2"
                    required
                    disabled={!currentProduct.category}
                  >
                    <option value="">Select Subcategory</option>
                    {currentProduct.category &&
                      categoryOptions[currentProduct.category]?.map((subcategory) => (
                        <option key={subcategory} value={subcategory}>
                          {subcategory}
                        </option>
                      ))}
                  </select>
                  {currentProduct.category && categoryOptions[currentProduct.category]?.length === 0 && (
                    <p className="text-xs text-red-500">No subcategories found. Try refreshing.</p>
                  )}
                </div>

                {currentProduct.category === 'fashion' && currentProduct.subcategory && (
                  <label className="flex flex-col gap-2 text-sm font-medium">
                    Product Type *
                    <select
                      value={currentProduct.tertiaryCategory}
                      onChange={(event) => handleFieldChange('tertiaryCategory', event.target.value)}
                      className="rounded-lg border px-3 py-2"
                      required
                    >
                      <option value="">Select Type</option>
                      {FASHION_TERTIARY[currentProduct.subcategory]?.map((type) => (
                        <option key={type} value={type}>
                          {type.replace(/-/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="flex flex-col gap-2 text-sm font-medium">
                  Original Price *
                  <input
                    type="number"
                    min="0"
                    value={currentProduct.originalPrice}
                    onChange={(event) => handleFieldChange('originalPrice', event.target.value)}
                    className="rounded-lg border px-3 py-2"
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium">
                  Discount Price *
                  <input
                    type="number"
                    min="0"
                    value={currentProduct.discountPrice}
                    onChange={(event) => handleFieldChange('discountPrice', event.target.value)}
                    className="rounded-lg border px-3 py-2"
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium">
                  Stock *
                  <input
                    type="number"
                    min="0"
                    value={currentProduct.stock}
                    onChange={(event) => handleFieldChange('stock', event.target.value)}
                    className="rounded-lg border px-3 py-2"
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium">
                  Weight (grams) *
                  <input
                    type="number"
                    min="0"
                    value={currentProduct.weight}
                    onChange={(event) => handleFieldChange('weight', event.target.value)}
                    className="rounded-lg border px-3 py-2"
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium">
                  Length (cm) *
                  <input
                    type="number"
                    min="0"
                    value={currentProduct.length}
                    onChange={(event) => handleFieldChange('length', event.target.value)}
                    className="rounded-lg border px-3 py-2"
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium">
                  Width (cm) *
                  <input
                    type="number"
                    min="0"
                    value={currentProduct.width}
                    onChange={(event) => handleFieldChange('width', event.target.value)}
                    className="rounded-lg border px-3 py-2"
                    required
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium">
                  Height (cm) *
                  <input
                    type="number"
                    min="0"
                    value={currentProduct.height}
                    onChange={(event) => handleFieldChange('height', event.target.value)}
                    className="rounded-lg border px-3 py-2"
                    required
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2 text-sm font-medium">
                Description *
                <textarea
                  value={currentProduct.description}
                  onChange={(event) => handleFieldChange('description', event.target.value)}
                  className="min-h-[120px] rounded-lg border px-3 py-2"
                  required
                />
              </label>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-3">
                  Product Images *
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Upload className="h-3 w-3" />
                    JPG/PNG, up to 5MB each
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {currentProduct.imageUrls.length}/10 files
                  </span>
                </label>
                
                {/* Drag & Drop Zone */}
                <div 
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    currentProduct.imageUrls.length >= 10 
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                      : 'border-gray-300 hover:border-blue-400 cursor-pointer'
                  }`}
                  onDragOver={(e) => { 
                    e.preventDefault(); 
                    if (currentProduct.imageUrls.length < 10) {
                      e.currentTarget.classList.add('border-blue-400', 'bg-blue-50') 
                    }
                  }}
                  onDragLeave={(e) => { 
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50') 
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
                    if (currentProduct.imageUrls.length < 10) {
                      handleImageUpload(e.dataTransfer.files)
                    }
                  }}
                >
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Drag & drop images here or click to browse</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={currentProduct.imageUrls.length >= 10 || currentProduct.uploadingImages}
                    onChange={(event) => handleImageUpload(event.target.files)}
                    className={`absolute inset-0 w-full h-full opacity-0 ${
                      currentProduct.imageUrls.length >= 10 ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  />
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                      disabled={currentProduct.imageUrls.length >= 10 || currentProduct.uploadingImages}
                      onClick={() => document.querySelector('input[type="file"][multiple]')?.click()}
                    >
                      {currentProduct.imageUrls.length >= 10 ? 'Maximum 10 images' : 'Choose Multiple'}
                    </button>
                    <label className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 cursor-pointer disabled:opacity-50">
                      Add One
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={currentProduct.imageUrls.length >= 10 || currentProduct.uploadingImages}
                        onChange={(event) => handleImageUpload(event.target.files)}
                      />
                    </label>
                  </div>
                </div>
                
                {/* Image Previews */}
                {currentProduct.imageUrls.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-3">Uploaded Images ({currentProduct.imageUrls.length})</h4>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
                      {currentProduct.imageUrls.map((imageUrl, index) => (
                        <div key={`${imageUrl}-${index}`} className="relative group overflow-hidden rounded-lg border bg-gray-50">
                          <img 
                            src={imageUrl} 
                            alt={`Product ${index + 1}`} 
                            className="h-32 w-full object-cover transition-transform group-hover:scale-105" 
                          />
                          
                          {/* Overlay with buttons */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="bg-blue-600 text-white px-3 py-1 rounded text-xs cursor-pointer hover:bg-blue-700">
                              Change
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) => event.target.files && replaceImage(index, event.target.files[0])}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setProduct(activeProductIndex, (draft) => ({
                                  ...draft,
                                  imageUrls: draft.imageUrls.filter((_, i) => i !== index),
                                  images: draft.images.filter((_, i) => i !== index)
                                }))
                              }}
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                          
                          {/* Image number badge */}
                          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {currentProduct.uploadingImages && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    Uploading images, please wait…
                  </div>
                )}
                
                {currentProduct.imageUrls.length === 0 && !currentProduct.uploadingImages && (
                  <p className="mt-2 text-xs text-red-500">⚠️ At least one image is required</p>
                )}
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:opacity-60"
                disabled={isSaving || vendorLoading}
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving…' : editingProductId ? 'Update Product' : 'Publish Products'}
              </button>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-lg bg-white p-5 shadow">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <Info className="h-5 w-5 text-blue-500" />
                Tips for faster approvals
              </h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Use high-quality product images (minimum 800×800).</li>
                <li>• Provide accurate dimensions, weight, and descriptions.</li>
                <li>• Highlight materials and usage instructions for clarity.</li>
                <li>• Keep pricing consistent and mention any discounts clearly.</li>
              </ul>
            </div>

            <div className="rounded-lg bg-white p-5 shadow">
              <h2 className="mb-3 text-lg font-semibold">Current Product Summary</h2>
              <dl className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <dt>Name</dt>
                  <dd className="font-medium">{currentProduct.name || 'Not set'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Category</dt>
                  <dd className="font-medium">{currentProduct.category || 'Not set'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Price</dt>
                  <dd className="font-medium">
                    {currentProduct.discountPrice ? `₹${currentProduct.discountPrice}` : 'Not set'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Stock</dt>
                  <dd className="font-medium">{currentProduct.stock || 'Not set'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Images</dt>
                  <dd className="font-medium">
                    {currentProduct.imageUrls.length || currentProduct.images.length}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
