'use client'

import { useEffect, useState } from 'react'

interface AnalyticsStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  avgOrderValue: number
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

const emptyStats: AnalyticsStats = {
  totalRevenue: 0,
  totalOrders: 0,
  totalCustomers: 0,
  avgOrderValue: 0
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [productsRes, customersRes, ordersRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/customers'),
        fetch('/api/admin/orders')
      ])

      const productsData: ProductsResponse = await productsRes.json()
      const customersData: CustomersResponse = await customersRes.json()
      const ordersData: OrdersResponse = await ordersRes.json()

      const orders = ordersData.orders ?? []
      const customers = customersData.customers ?? []

      const totalRevenue = orders.reduce((sum, order) => sum + (order.total ?? 0), 0)
      const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalCustomers: customers.length,
        avgOrderValue
      })
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching analytics:', error.message)
      } else {
        console.error('Error fetching analytics:', error)
      }
      setStats(emptyStats)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  INR {(stats ?? emptyStats).totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="text-3xl">Rs</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(stats ?? emptyStats).totalOrders}
                </p>
              </div>
              <div className="text-3xl">#</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(stats ?? emptyStats).totalCustomers}
                </p>
              </div>
              <div className="text-3xl">Users</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-orange-600">
                  INR {(stats ?? emptyStats).avgOrderValue.toLocaleString()}
                </p>
              </div>
              <div className="text-3xl">~</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
