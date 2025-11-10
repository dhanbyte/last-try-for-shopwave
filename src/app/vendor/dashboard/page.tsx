'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, ShoppingCart, TrendingUp, Plus, Edit, Bell, Eye } from 'lucide-react'

import VendorDashboardSkeleton from '@/components/VendorDashboardSkeleton'

type VendorStats = {
  totalProducts: number
  totalOrders: number
  totalEarnings: number
  pendingOrders: number
}

type VendorSummary = {
  id: string
  email?: string
  businessName?: string
}

type VendorNotification = {
  _id: string
  title: string
  message: string
  read?: boolean
  createdAt?: string
}

type VendorOrderSummary = {
  _id: string
  orderId: string
  status: string
  vendorTotal?: number
  createdAt?: string
  customerEmail?: string
}

type VendorProfileResponse = {
  success: boolean
  vendor?: {
    _id: string
    email?: string
    businessName?: string
    totalProducts?: number
    totalOrders?: number
    totalEarnings?: number
    pendingOrders?: number
  }
  error?: string
}

type NotificationsResponse = {
  notifications?: VendorNotification[]
}

type OrdersResponse = {
  orders?: VendorOrderSummary[]
}

const EMPTY_STATS: VendorStats = {
  totalProducts: 0,
  totalOrders: 0,
  totalEarnings: 0,
  pendingOrders: 0,
}

const parseNotification = (notification: unknown): VendorNotification | null => {
  if (!notification || typeof notification !== 'object') return null
  const candidate = notification as Record<string, unknown>
  if (typeof candidate._id !== 'string' || typeof candidate.title !== 'string' || typeof candidate.message !== 'string') {
    return null
  }

  return {
    _id: candidate._id,
    title: candidate.title,
    message: candidate.message,
    read: typeof candidate.read === 'boolean' ? candidate.read : false,
    createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : undefined,
  }
}

const parseOrder = (order: unknown): VendorOrderSummary | null => {
  if (!order || typeof order !== 'object') return null
  const candidate = order as Record<string, unknown>
  if (typeof candidate._id !== 'string' || typeof candidate.orderId !== 'string' || typeof candidate.status !== 'string') {
    return null
  }
  return {
    _id: candidate._id,
    orderId: candidate.orderId,
    status: candidate.status,
    vendorTotal: typeof candidate.vendorTotal === 'number' ? candidate.vendorTotal : undefined,
    createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : undefined,
    customerEmail: typeof candidate.customerEmail === 'string' ? candidate.customerEmail : undefined,
  }
}

export default function VendorDashboard() {
  const [stats, setStats] = useState<VendorStats | null>(null)
  const [vendorInfo, setVendorInfo] = useState<VendorSummary | null>(null)
  const [notifications, setNotifications] = useState<VendorNotification[]>([])
  const [recentOrders, setRecentOrders] = useState<VendorOrderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [lastFetch, setLastFetch] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const loadVendorData = async () => {
      try {
        const isLoggedIn = typeof window !== 'undefined' ? localStorage.getItem('vendorLoggedIn') : null
        const vendorDataStr = typeof window !== 'undefined' ? localStorage.getItem('vendorData') : null

        if (isLoggedIn === 'true' && vendorDataStr) {
          const vendor = JSON.parse(vendorDataStr) as {
            _id?: string
            id?: string
            email?: string
            businessName?: string
          }
          const identifier = vendor.id ?? vendor._id
          if (identifier) {
            const summary: VendorSummary = {
              id: identifier,
              email: vendor.email,
              businessName: vendor.businessName,
            }
            setVendorInfo(summary)
            await fetchVendorData(summary.id)
            return
          }
        }

        const response = await fetch('/api/vendor/session')
        const session = await response.json()
        if (session.success && session.vendor?._id) {
          const summary: VendorSummary = {
            id: session.vendor._id,
            email: session.vendor.email,
            businessName: session.vendor.businessName,
          }
          setVendorInfo(summary)
          await fetchVendorData(summary.id)
        } else {
          localStorage.clear()
          window.location.href = '/vendor/login'
        }
      } catch (error) {
        console.error('Vendor session check failed:', error)
        localStorage.clear()
        window.location.href = '/vendor/login'
      }
    }

    void loadVendorData()
  }, [])

  const fetchVendorData = async (vendorId: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true)

    try {
      const timestamp = Date.now()
      const profileRes = await fetch(`/api/vendor/profile?vendorId=${vendorId}&t=${timestamp}`)
      const profileData = (await profileRes.json()) as VendorProfileResponse

      if (profileData.success && profileData.vendor) {
        const { totalProducts, totalOrders, totalEarnings, pendingOrders } = profileData.vendor
        setStats({
          totalProducts: totalProducts ?? 0,
          totalOrders: totalOrders ?? 0,
          totalEarnings: totalEarnings ?? 0,
          pendingOrders: pendingOrders ?? 0,
        })
      } else {
        console.error('Vendor profile API failed:', profileData.error)
        setStats(EMPTY_STATS)
      }

      const [notificationsResult, ordersResult] = await Promise.allSettled([
        fetch(`/api/vendor/notifications?vendorId=${vendorId}&limit=5`).then((res) =>
          res.ok ? (res.json() as Promise<NotificationsResponse>) : null,
        ),
        fetch(`/api/vendor/orders?vendorId=${vendorId}&limit=5`).then((res) =>
          res.ok ? (res.json() as Promise<OrdersResponse>) : null,
        ),
      ])

      if (notificationsResult.status === 'fulfilled' && notificationsResult.value) {
        const parsed = (notificationsResult.value.notifications ?? []).map(parseNotification).filter(Boolean) as VendorNotification[]
        setNotifications(parsed)
      } else {
        setNotifications([])
      }

      if (ordersResult.status === 'fulfilled' && ordersResult.value) {
        const parsed = (ordersResult.value.orders ?? []).map(parseOrder).filter(Boolean) as VendorOrderSummary[]
        setRecentOrders(parsed)
      } else {
        setRecentOrders([])
      }

      setLastFetch(timestamp)
    } catch (error) {
      console.error('Error fetching vendor data:', error)
      setStats(EMPTY_STATS)
      setNotifications([])
      setRecentOrders([])
    } finally {
      setLoading(false)
      if (isRefresh) setRefreshing(false)
    }
  }

  const refreshData = () => {
    if (vendorInfo?.id && !refreshing) {
      void fetchVendorData(vendorInfo.id, true)
    }
  }

  const markNotificationRead = async (notificationId: string) => {
    try {
      await fetch('/api/vendor/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, read: true }),
      })

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification,
        ),
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/vendor/logout', { method: 'POST' })
    } catch (error) {
      console.error('Failed to log out:', error)
    } finally {
      localStorage.clear()
      window.location.href = '/vendor/login'
    }
  }

  if (loading) {
    return <VendorDashboardSkeleton />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">
              Welcome, {vendorInfo?.businessName || vendorInfo?.email || 'Vendor'}
            </span>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="rounded border px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
            >
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>

            <button onClick={logout} className="rounded border px-3 py-1 hover:bg-gray-50">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        {(stats?.totalProducts ?? 0) === 0 && (
          <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <h2 className="mb-2 text-xl font-bold">Welcome to ShopWave Vendor Portal!</h2>
            <p className="mb-4">Get started by adding your first product and start selling online.</p>
            <Link href="/vendor/add-product" className="inline-block">
              <span className="rounded bg-white px-4 py-2 font-medium text-blue-600 hover:bg-gray-100">
                Add Your First Product
              </span>
            </Link>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Products</p>
                <p className="text-2xl font-bold">{stats?.totalProducts ?? 0}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats?.totalOrders ?? 0}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold">{stats?.pendingOrders ?? 0}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold">
                  ₹{(stats?.totalEarnings ?? 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Bell className="h-5 w-5" />
                Notifications
              </h2>
              <div className="max-h-96 space-y-3 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500">No new notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification._id}
                      type="button"
                      className={`w-full rounded-lg border p-3 text-left ${
                        notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                      }`}
                      onClick={() => markNotificationRead(notification._id)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-sm font-medium">{notification.title}</h3>
                          <p className="mt-1 text-xs text-gray-600">{notification.message}</p>
                          <p className="mt-2 text-xs text-gray-400">
                            {notification.createdAt
                              ? new Date(notification.createdAt).toLocaleDateString()
                              : '—'}
                          </p>
                        </div>
                        {!notification.read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
                <Link href="/vendor/orders" className="text-sm text-blue-600 hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {recentOrders.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-gray-500">
                    <ShoppingCart className="mb-2 h-12 w-12 text-gray-300" />
                    <p>No orders yet</p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between rounded border p-3">
                      <div>
                        <p className="text-sm font-medium">Order #{order.orderId}</p>
                        <p className="text-xs text-gray-500">{order.customerEmail ?? 'No email'}</p>
                        <p className="text-xs text-gray-400">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{(order.vendorTotal ?? 0).toLocaleString()}</p>
                        <span
                          className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs ${
                            order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'shipped'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Link href="/vendor/add-product" className="rounded-lg border p-4 text-center hover:bg-gray-50">
              <Plus className="mx-auto mb-2 h-6 w-6 text-blue-500" />
              <span className="text-sm font-medium">Add Product</span>
            </Link>
            <Link href="/vendor/products" className="rounded-lg border p-4 text-center hover:bg-gray-50">
              <Package className="mx-auto mb-2 h-6 w-6 text-green-500" />
              <span className="text-sm font-medium">My Products</span>
            </Link>
            <Link href="/vendor/orders" className="rounded-lg border p-4 text-center hover:bg-gray-50">
              <ShoppingCart className="mx-auto mb-2 h-6 w-6 text-purple-500" />
              <span className="text-sm font-medium">My Orders</span>
            </Link>
            <Link href="/vendor/earnings" className="rounded-lg border p-4 text-center hover:bg-gray-50">
              <TrendingUp className="mx-auto mb-2 h-6 w-6 text-orange-500" />
              <span className="text-sm font-medium">Earnings</span>
            </Link>
            <Link href="/vendor/profile" className="rounded-lg border p-4 text-center hover:bg-gray-50">
              <Edit className="mx-auto mb-2 h-6 w-6 text-gray-500" />
              <span className="text-sm font-medium">My Profile</span>
            </Link>
          </div>
        </section>

        {lastFetch && (
          <div className="mt-4 text-right text-xs text-gray-400">
            Last updated {new Date(lastFetch).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}
