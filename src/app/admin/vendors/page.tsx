'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  CheckCircle,
  Copy,
  Mail,
  MapPin,
  Package,
  Phone,
  Search,
  Users,
  XCircle
} from 'lucide-react'

interface VendorAddress {
  street?: string
  city?: string
  state?: string
  pincode?: string
}

interface VendorBankDetails {
  bankName?: string
  accountNumber?: string
  ifscCode?: string
  accountHolder?: string
}

interface VendorStats {
  totalOrders?: number
  totalRevenue?: number
  totalProducts?: number
}

interface Vendor {
  _id: string
  vendorId?: string
  name?: string
  businessName?: string
  email?: string
  phone?: string
  status?: string
  commission?: number
  createdAt?: string
  address?: VendorAddress
  bankDetails?: VendorBankDetails
  stats?: VendorStats
  password?: string
}

interface VendorsResponse {
  success: boolean
  vendors?: Vendor[]
}

interface VendorProduct {
  _id: string
  name?: string
  price?: number
  status?: string
  stock?: number
  createdAt?: string
}

interface VendorProductsResponse {
  success: boolean
  products?: VendorProduct[]
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [vendorProducts, setVendorProducts] = useState<VendorProduct[]>([])

  useEffect(() => {
    void fetchVendors()
  }, [])

  useEffect(() => {
    if (selectedVendor?._id) {
      void fetchVendorProducts(selectedVendor._id)
    } else {
      setVendorProducts([])
    }
  }, [selectedVendor])

  const fetchVendors = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/vendors')
      const data = (await response.json()) as VendorsResponse

      if (data.success && Array.isArray(data.vendors)) {
        setVendors(data.vendors)
      } else {
        setVendors([])
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching vendors:', error.message)
      } else {
        console.error('Error fetching vendors:', error)
      }
      setVendors([])
    } finally {
      setLoading(false)
    }
  }

  const fetchVendorProducts = async (vendorId: string) => {
    try {
      const response = await fetch(`/api/admin/vendor-products?vendorId=${vendorId}`)
      const data = (await response.json()) as VendorProductsResponse

      if (data.success && Array.isArray(data.products)) {
        setVendorProducts(data.products)
      } else {
        setVendorProducts([])
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching vendor products:', error.message)
      } else {
        console.error('Error fetching vendor products:', error)
      }
      setVendorProducts([])
    }
  }

  const updateVendorStatus = async (vendorId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/vendors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, status })
      })

      if (response.ok) {
        alert(`Vendor status updated to ${status}`)
        await fetchVendors()
        setSelectedVendor((current) =>
          current && current._id === vendorId ? { ...current, status } : current
        )
      } else {
        alert('Failed to update vendor status')
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`Failed to update vendor status: ${error.message}`)
      } else {
        alert('Failed to update vendor status')
      }
    }
  }

  const deleteVendor = async (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) {
      return
    }

    try {
      const response = await fetch('/api/admin/vendors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId })
      })

      if (response.ok) {
        alert('Vendor deleted successfully')
        await fetchVendors()
        setSelectedVendor((current) => (current && current._id === vendorId ? null : current))
      } else {
        alert('Failed to delete vendor')
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`Failed to delete vendor: ${error.message}`)
      } else {
        alert('Failed to delete vendor')
      }
    }
  }

  const updateCommission = async (vendorId: string, commission: number) => {
    try {
      const response = await fetch('/api/admin/vendors/commission', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, commission })
      })

      if (response.ok) {
        alert('Commission updated')
        await fetchVendors()
        setSelectedVendor((current) =>
          current && current._id === vendorId ? { ...current, commission } : current
        )
      } else {
        alert('Failed to update commission')
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`Failed to update commission: ${error.message}`)
      } else {
        alert('Failed to update commission')
      }
    }
  }

  const copyVendorInfo = (vendor: Vendor) => {
    const info = [
      `Vendor ID: ${vendor.vendorId ?? 'Not generated'}`,
      `Business Name: ${vendor.businessName ?? 'N/A'}`,
      `Owner: ${vendor.name ?? 'N/A'}`,
      `Email: ${vendor.email ?? 'N/A'}`,
      `Password: ${vendor.password ?? 'Not set'}`,
      `Phone: ${vendor.phone ?? 'N/A'}`,
      `Address: ${formatAddress(vendor.address)}`,
      `Status: ${vendor.status ?? 'N/A'}`,
      `Commission: ${vendor.commission ?? 0}%`,
      `Joined: ${
        vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'Unknown'
      }`
    ]
      .filter(Boolean)
      .join('\n')

    void navigator.clipboard.writeText(info)
    alert('Vendor info copied to clipboard')
  }

  const filteredVendors = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) {
      return vendors
    }

    return vendors.filter((vendor) => {
      const nameMatch = vendor.name?.toLowerCase().includes(query)
      const businessMatch = vendor.businessName?.toLowerCase().includes(query)
      const emailMatch = vendor.email?.toLowerCase().includes(query)
      return nameMatch || businessMatch || emailMatch
    })
  }, [vendors, searchTerm])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vendors</h1>
        <span className="text-sm text-gray-600">{vendors.length} total vendors</span>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search vendors by name, business, or email..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Vendor List ({filteredVendors.length})</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
              <p className="text-gray-600">Loading vendors...</p>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No vendors found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredVendors.map((vendor) => (
                <button
                  key={vendor._id}
                  type="button"
                  className={`w-full text-left p-4 hover:bg-gray-50 ${
                    selectedVendor?._id === vendor._id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedVendor(vendor)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{vendor.businessName ?? vendor.name ?? 'Vendor'}</h3>
                      <p className="text-sm text-gray-500">{vendor.email ?? 'No email'}</p>
                    </div>
                    <div
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        vendor.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : vendor.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {vendor.status ?? 'pending'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow min-h-[300px]">
          {selectedVendor ? (
            <>
              <div className="p-6 border-b flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {selectedVendor.businessName ?? selectedVendor.name ?? 'Vendor'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Vendor ID: {selectedVendor.vendorId ?? 'Not generated'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Joined:{' '}
                    {selectedVendor.createdAt
                      ? new Date(selectedVendor.createdAt).toLocaleDateString()
                      : 'Unknown'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      updateVendorStatus(
                        selectedVendor._id,
                        selectedVendor.status === 'approved' ? 'pending' : 'approved'
                      )
                    }
                    className="flex items-center gap-1 px-3 py-1 rounded bg-green-100 text-green-700 text-sm"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {selectedVendor.status === 'approved' ? 'Mark Pending' : 'Approve'}
                  </button>
                  <button
                    onClick={() => updateVendorStatus(selectedVendor._id, 'rejected')}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-red-100 text-red-700 text-sm"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => copyVendorInfo(selectedVendor)}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 text-gray-700 text-sm"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{selectedVendor.email ?? 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{selectedVendor.phone ?? 'No phone number'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{formatAddress(selectedVendor.address)}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Financial Details</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Commission: {selectedVendor.commission ?? 0}%</p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={selectedVendor.commission ?? 0}
                        className="w-24 px-2 py-1 border rounded"
                        onBlur={(event) =>
                          updateCommission(selectedVendor._id, Number(event.target.value) || 0)
                        }
                      />
                      <span className="text-xs text-gray-500 self-center">
                        Blur the field to save changes
                      </span>
                    </div>
                    <div>
                      <p>Bank Name: {selectedVendor.bankDetails?.bankName ?? 'N/A'}</p>
                      <p>Account Number: {selectedVendor.bankDetails?.accountNumber ?? 'N/A'}</p>
                      <p>IFSC: {selectedVendor.bankDetails?.ifscCode ?? 'N/A'}</p>
                      <p>Account Holder: {selectedVendor.bankDetails?.accountHolder ?? 'N/A'}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-500">Total Orders</p>
                      <p className="text-xl font-semibold">
                        {selectedVendor.stats?.totalOrders ?? 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-500">Total Revenue</p>
                      <p className="text-xl font-semibold">
                        INR {(selectedVendor.stats?.totalRevenue ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm text-gray-500">Total Products</p>
                      <p className="text-xl font-semibold">
                        {selectedVendor.stats?.totalProducts ?? vendorProducts.length}
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Products</h3>
                  {vendorProducts.length === 0 ? (
                    <p className="text-sm text-gray-500">No products found for this vendor.</p>
                  ) : (
                    <div className="space-y-2">
                      {vendorProducts.map((product) => (
                        <div key={product._id} className="flex justify-between border rounded p-3">
                          <div>
                            <p className="font-medium">{product.name ?? 'Untitled product'}</p>
                            <p className="text-sm text-gray-500">
                              Added:{' '}
                              {product.createdAt
                                ? new Date(product.createdAt).toLocaleDateString()
                                : 'Unknown'}
                            </p>
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            <p>Status: {product.status ?? 'pending'}</p>
                            <p>Stock: {product.stock ?? 0}</p>
                            <p>Price: INR {(product.price ?? 0).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <button
                  onClick={() => deleteVendor(selectedVendor._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  <XCircle className="h-4 w-4" />
                  Delete Vendor
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
              <Package className="h-12 w-12 mb-4 text-gray-300" />
              <p>Select a vendor to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatAddress(address?: VendorAddress): string {
  if (!address) {
    return 'No address on file'
  }

  const parts = [address.street, address.city, address.state, address.pincode].filter(
    (value): value is string => Boolean(value)
  )

  return parts.length > 0 ? parts.join(', ') : 'No address on file'
}
