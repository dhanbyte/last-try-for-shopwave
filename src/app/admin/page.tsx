'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  totalRevenue: number
}

interface ProductsResponse {
  products?: unknown[]
}

interface CustomersResponse {
  customers?: unknown[]
}

interface OrdersResponse {
  orders?: Array<{ total?: number }>
}

const emptyStats: DashboardStats = {
  totalProducts: 0,
  totalOrders: 0,
  totalCustomers: 0,
  totalRevenue: 0
}

const quickLinks = [
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/vendors', label: 'Vendors' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/pending-products', label: 'Pending Products' },
  { href: '/', label: 'Website' }
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [productsRes, vendorProductsRes, customersRes, ordersRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/vendor-products'),
        fetch('/api/admin/customers'),
        fetch('/api/admin/orders')
      ])

      const productsData: ProductsResponse = await productsRes.json()
      const vendorProductsData: ProductsResponse = await vendorProductsRes.json()
      const customersData: CustomersResponse = await customersRes.json()
      const ordersData: OrdersResponse = await ordersRes.json()

      const orders = ordersData.orders ?? []
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total ?? 0), 0)

      setStats({
        totalProducts:
          (productsData.products?.length ?? 0) + (vendorProductsData.products?.length ?? 0),
        totalOrders: orders.length,
        totalCustomers: customersData.customers?.length ?? 0,
        totalRevenue
      })
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching stats:', error.message)
      } else {
        console.error('Error fetching stats:', error)
      }
      setStats(emptyStats)
    } finally {
      setLoading(false)
    }
  }

  const statCards = useMemo(
    () => [
      { title: 'Total Products', value: (stats ?? emptyStats).totalProducts },
      { title: 'Total Orders', value: (stats ?? emptyStats).totalOrders },
      { title: 'Total Customers', value: (stats ?? emptyStats).totalCustomers },
      { title: 'Total Revenue', value: `INR ${(stats ?? emptyStats).totalRevenue.toLocaleString()}` }
    ],
    [stats]
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link href="/admin/add-product">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + Add Product
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-8 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => (
            <div key={card.title} className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold mt-2">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <button className="w-full p-4 border rounded-lg hover:bg-gray-50 text-center">
                <div className="text-sm font-medium">{link.label}</div>
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
