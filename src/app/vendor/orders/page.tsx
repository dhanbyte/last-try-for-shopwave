'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ShoppingBag,
  ShoppingCart,
  Eye,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Truck,
  CheckCircle,
  XCircle,
  Copy,
  Clock,
  Search,
} from 'lucide-react'

type VendorOrderItem = {
  productId?: string
  name?: string
  quantity?: number
  price?: number
  image?: string
  brand?: string
  customName?: string | null
}

type VendorOrder = {
  _id: string
  orderId: string
  status: string
  total: number
  createdAt?: string
  paymentId?: string
  customerDetails?: {
    name?: string
    email?: string
    phone?: string
  }
  shippingAddress?: {
    street?: string
    city?: string
    state?: string
    pincode?: string
  }
  products?: VendorOrderItem[]
}

const STATUS_SEQUENCE: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

const statusBadge = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'confirmed':
      return 'bg-blue-100 text-blue-800'
    case 'shipped':
      return 'bg-purple-100 text-purple-800'
    case 'delivered':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const statusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />
    case 'confirmed':
      return <Package className="h-4 w-4 text-blue-500" />
    case 'shipped':
      return <Truck className="h-4 w-4 text-purple-500" />
    case 'delivered':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

export default function MyOrders() {
  const [orders, setOrders] = useState<VendorOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
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

      if (!window.location.pathname.includes('/vendor/login')) {
        window.location.href = '/vendor/login'
      }
    }

    void loadVendorData()
  }, [])

  useEffect(() => {
    if (!vendorId) return
    void fetchOrders(vendorId)
  }, [vendorId])

  const fetchOrders = async (id: string) => {
    try {
      const response = await fetch(`/api/vendor/orders?vendorId=${id}`)
      const data = await response.json()

      if (data.success && Array.isArray(data.orders)) {
        setOrders(
          data.orders.filter((order: unknown): order is VendorOrder => {
            if (!order || typeof order !== 'object') return false
            const candidate = order as VendorOrder
            return typeof candidate._id === 'string' && typeof candidate.orderId === 'string'
          }),
        )
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch('/api/vendor/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      })

      if (response.ok) {
        alert('Order status updated')
        if (vendorId) {
          await fetchOrders(vendorId)
        }
      }
    } catch (error) {
      alert('Failed to update order status')
    }
  }

  const copyCustomerDetails = (order: VendorOrder) => {
    const details = `
Order: ${order.orderId}
Customer: ${order.customerDetails?.name || 'N/A'}
Email: ${order.customerDetails?.email || 'N/A'}
Phone: ${order.customerDetails?.phone || 'N/A'}
${order.shippingAddress ? `
Address: ${order.shippingAddress.street}
City: ${order.shippingAddress.city}
State: ${order.shippingAddress.state}
Pincode: ${order.shippingAddress.pincode}` : ''}
Total: ₹${order.total}
Status: ${order.status}
    `.trim()

    void navigator.clipboard.writeText(details)
    alert('Customer details copied to clipboard!')
  }

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return orders
    return orders.filter((order) => {
      const orderMatches = order.orderId.toLowerCase().includes(term)
      const nameMatches = order.customerDetails?.name?.toLowerCase().includes(term)
      const emailMatches = order.customerDetails?.email?.toLowerCase().includes(term)
      const statusMatches = order.status.toLowerCase().includes(term)
      return orderMatches || nameMatches || emailMatches || statusMatches
    })
  }, [orders, searchTerm])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading orders…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <ShoppingBag className="h-6 w-6 text-blue-500" />
            My Orders ({orders.length})
          </h1>
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search orders by ID, customer name, email, or status..."
              className="w-full rounded-lg border px-9 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 p-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center rounded-lg border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
              <ShoppingCart className="mb-4 h-12 w-12 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-900">No orders yet</h3>
              <p>Orders will appear here when customers buy your products.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <button
                key={order._id}
                type="button"
                onClick={() => setSelectedOrder(order)}
                className="w-full rounded-lg border bg-white p-6 text-left shadow-sm transition hover:border-blue-300 hover:shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Order #{order.orderId}</h3>
                    <div className="mt-2 grid gap-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{order.customerDetails?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{order.customerDetails?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{order.customerDetails?.phone || 'Phone not provided'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">₹{order.total.toLocaleString()}</div>
                    <div className={`mt-1 inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs ${statusBadge(order.status)}`}>
                      {statusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {order.products?.length || 0} item{order.products && order.products.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </section>

        <aside className="space-y-4">
          {selectedOrder ? (
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="mb-6 flex items-start justify-between border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold">Order #{selectedOrder.orderId}</h2>
                  <p className="text-sm text-gray-600">
                    Placed on{' '}
                    {selectedOrder.createdAt
                      ? new Date(selectedOrder.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">₹{selectedOrder.total.toLocaleString()}</div>
                  <div
                    className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${statusBadge(
                      selectedOrder.status,
                    )}`}
                  >
                    {statusIcon(selectedOrder.status)}
                    <span className="capitalize">{selectedOrder.status}</span>
                  </div>
                </div>
              </div>

              <section className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <User className="h-5 w-5" />
                    Customer Details
                  </h3>
                  <button
                    onClick={() => copyCustomerDetails(selectedOrder)}
                    className="flex items-center gap-1 rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Details
                  </button>
                </div>
                <div className="space-y-2 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Name:</span>
                    <span>{selectedOrder.customerDetails?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Email:</span>
                    <span>{selectedOrder.customerDetails?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Phone:</span>
                    <span>{selectedOrder.customerDetails?.phone || 'N/A'}</span>
                  </div>
                  {selectedOrder.shippingAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">Shipping Address:</div>
                        <div className="text-sm text-gray-600">
                          {selectedOrder.shippingAddress.street}
                          <br />
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                          <br />
                          {selectedOrder.shippingAddress.pincode}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedOrder.paymentId && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Payment ID:</span>
                      <span>{selectedOrder.paymentId}</span>
                    </div>
                  )}
                </div>
              </section>

              <section className="mb-6">
                <h3 className="mb-3 text-lg font-semibold">
                  Order Items ({selectedOrder.products?.length ?? 0})
                </h3>
                <div className="space-y-3">
                  {selectedOrder.products?.map((item, index) => (
                    <div key={`${item.productId ?? index}`} className="flex items-center gap-4 rounded-lg border p-3">
                      <img
                        src={item.image || '/images/placeholder.jpg'}
                        alt={item.name}
                        className="h-16 w-16 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity ?? 0}</p>
                        {item.brand && <p className="text-xs text-gray-500">Brand: {item.brand}</p>}
                        {item.customName && (
                          <p className="text-xs text-blue-500">Customisation: “{item.customName}”</p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">
                          ₹{((item.price ?? 0) * (item.quantity ?? 0)).toLocaleString()}
                        </div>
                        <div className="text-gray-500">
                          ₹{(item.price ?? 0).toLocaleString()} per item
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mb-6 rounded-lg bg-gray-50 p-4">
                <h3 className="mb-3 text-lg font-semibold">Order Summary</h3>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₹{(selectedOrder.total ?? 0).toLocaleString()}</span>
                </div>
              </section>

              <section className="border-t pt-4">
                <h3 className="mb-3 text-lg font-semibold">Update Order Status</h3>
                <div className="flex flex-wrap gap-3">
                  {STATUS_SEQUENCE[selectedOrder.status]?.map((status) => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(selectedOrder._id, status)}
                      className="flex items-center gap-2 rounded border px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4" />
                      Mark as {status}
                    </button>
                  ))}
                  {STATUS_SEQUENCE[selectedOrder.status]?.length === 0 && (
                    <p className="text-sm text-gray-500">No further actions available.</p>
                  )}
                </div>
              </section>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 bg-white p-10 text-center text-gray-500">
              <ShoppingBag className="mx-auto mb-4 h-10 w-10 text-gray-300" />
              <p>Select an order to view details.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
