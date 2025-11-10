'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle,
  Clock,
  Copy,
  Mail,
  MapPin,
  Package,
  Phone,
  Search,
  Truck
} from 'lucide-react'

interface ShippingAddress {
  name?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
}

interface OrderItem {
  name: string
  quantity: number
  price: number
  image?: string
}

interface Order {
  _id: string
  orderId: string
  userId: string
  status: string
  createdAt: string
  total: number
  paymentId?: string
  shippingAddress?: ShippingAddress
  items?: OrderItem[]
}

interface OrdersResponse {
  success: boolean
  orders?: Order[]
}

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const formatCurrency = (value: number | undefined) => `INR ${(value ?? 0).toLocaleString()}`

const statusIconMap: Record<string, JSX.Element> = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  processing: <Package className="h-4 w-4 text-blue-500" />,
  shipped: <Truck className="h-4 w-4 text-purple-500" />,
  delivered: <CheckCircle className="h-4 w-4 text-green-500" />,
  cancelled: <Clock className="h-4 w-4 text-red-500" />
}

const statusColorMap: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    void fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/orders')
      const data = (await response.json()) as OrdersResponse

      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders)
      } else {
        setOrders([])
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching orders:', error.message)
      } else {
        console.error('Error fetching orders:', error)
      }
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      })

      const data = await response.json()

      if (data.success) {
        alert(`Order status updated to ${status}`)
        await fetchOrders()
        setSelectedOrder((prev) => (prev && prev.orderId === orderId ? { ...prev, status } : prev))
      } else {
        alert('Error updating order status')
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error updating order status: ${error.message}`)
      } else {
        alert('Error updating order status')
      }
    }
  }

  const copyCustomerDetails = (order: Order) => {
    const address = order.shippingAddress
    const details = [
      `Order: ${order.orderId}`,
      `Customer: ${order.userId}`,
      address?.name ? `Name: ${address.name}` : '',
      address?.phone ? `Phone: ${address.phone}` : '',
      address?.address ? `Address: ${address.address}` : '',
      address?.city ? `City: ${address.city}` : '',
      address?.state ? `State: ${address.state}` : '',
      address?.pincode ? `Pincode: ${address.pincode}` : '',
      order.paymentId ? `Payment ID: ${order.paymentId}` : '',
      `Total: ${formatCurrency(order.total)}`
    ]
      .filter(Boolean)
      .join('\n')

    void navigator.clipboard.writeText(details)
    alert('Customer details copied to clipboard!')
  }

  const getStatusIcon = (status: string) =>
    statusIconMap[status] ?? <Clock className="h-4 w-4 text-gray-500" />

  const getStatusColor = (status: string) =>
    statusColorMap[status] ?? 'bg-gray-100 text-gray-800'

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) {
      return orders
    }

    return orders.filter((order) => {
      const orderIdMatch = order.orderId?.toLowerCase().includes(query)
      const userMatch = order.userId?.toLowerCase().includes(query)
      const statusMatch = order.status?.toLowerCase().includes(query)

      return orderIdMatch || userMatch || statusMatch
    })
  }, [orders, searchTerm])

  if (selectedOrder) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setSelectedOrder(null)}
            className="text-blue-600 hover:text-blue-800"
          >
            {'< Back to Orders'}
          </button>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6 pb-4 border-b">
            <div>
              <h2 className="text-2xl font-bold">Order #{selectedOrder.orderId}</h2>
              <p className="text-gray-600">
                Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {formatCurrency(selectedOrder.total)}
              </div>
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusColor(selectedOrder.status)}`}
              >
                {getStatusIcon(selectedOrder.status)}
                {selectedOrder.status}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Customer Details
              </h3>
              <button
                onClick={() => copyCustomerDetails(selectedOrder)}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                <Copy className="h-4 w-4" />
                Copy Details
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Email:</span> {selectedOrder.userId}
                  </div>
                  {selectedOrder.shippingAddress && (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">Name:</span>{' '}
                        {selectedOrder.shippingAddress.name ?? 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Phone:</span>{' '}
                        {selectedOrder.shippingAddress.phone ?? 'N/A'}
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {selectedOrder.shippingAddress && (
                    <div className="mb-2">
                      <span className="font-medium">Address:</span>
                      <div className="text-gray-700">
                        {selectedOrder.shippingAddress.address ?? 'N/A'}
                        <br />
                        {selectedOrder.shippingAddress.city ?? 'N/A'},{' '}
                        {selectedOrder.shippingAddress.state ?? 'N/A'}
                        <br />
                        Pincode: {selectedOrder.shippingAddress.pincode ?? 'N/A'}
                      </div>
                    </div>
                  )}
                  {selectedOrder.paymentId && (
                    <div className="mb-2">
                      <span className="font-medium">Payment ID:</span>{' '}
                      {selectedOrder.paymentId}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Order Items</h3>
            {selectedOrder.items && selectedOrder.items.length > 0 ? (
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex items-center gap-4 p-3 border rounded-lg"
                  >
                    <img
                      src={item.image ?? '/images/placeholder.jpg'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(item.price)}</div>
                      <div className="text-sm text-gray-500">per item</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No items found for this order.</p>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Update Order Status</h3>
            <div className="flex gap-3">
              <select
                value={selectedOrder.status}
                onChange={(event) => updateOrderStatus(selectedOrder.orderId, event.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Orders Management</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search orders by ID, customer, or status..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">All Orders ({filteredOrders.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredOrders.map((order) => (
              <button
                key={order._id}
                type="button"
                className="w-full text-left p-6 hover:bg-gray-50"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">Order #{order.orderId}</h3>
                    <p className="text-gray-600">{order.userId}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()} ·{' '}
                      {order.items?.length ?? 0} items
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{formatCurrency(order.total)}</div>
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
