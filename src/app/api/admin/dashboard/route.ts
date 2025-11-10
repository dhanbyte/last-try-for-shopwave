import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'

interface AddressRecord {
  city?: string
}

interface OrderRecord {
  userId: string
  data?: Array<{
    total?: number
    status?: string
    paymentMethod?: string
  }>
}

interface AddressDataRecord {
  data?: AddressRecord[]
}

type OrdersDocument = OrderRecord & { userId: string }

export async function GET(_request: Request) {
  try {
    const db = await getDatabase()

    const allUserData = await db
      .collection<OrdersDocument>('user_data')
      .find({ type: 'orders' })
      .toArray()

    let totalOrders = 0
    let totalRevenue = 0
    let pendingRevenue = 0
    const uniqueCustomers = new Set<string>()
    const paymentGateways: Record<string, number> = {}
    const orderStatuses: Record<string, number> = {}

    const addressData = await db
      .collection<AddressDataRecord>('user_data')
      .find({ type: 'addresses' })
      .toArray()

    let totalAddresses = 0
    const cities: Record<string, number> = {}

    for (const userData of addressData) {
      if (Array.isArray(userData.data)) {
        totalAddresses += userData.data.length
        for (const addr of userData.data) {
          if (addr.city) {
            cities[addr.city] = (cities[addr.city] ?? 0) + 1
          }
        }
      }
    }

    for (const userData of allUserData) {
      if (Array.isArray(userData.data)) {
        totalOrders += userData.data.length
        uniqueCustomers.add(userData.userId)

        for (const order of userData.data) {
          const orderTotal = normalizeNumber(order.total)
          const status = order.status ?? 'Unknown'

          if (status === 'Delivered') {
            totalRevenue += orderTotal
          } else if (status !== 'Cancelled') {
            pendingRevenue += orderTotal
          }

          if (order.paymentMethod) {
            paymentGateways[order.paymentMethod] = (paymentGateways[order.paymentMethod] ?? 0) + 1
          }

          orderStatuses[status] = (orderStatuses[status] ?? 0) + 1
        }
      }
    }

    const topCities = Object.entries(cities)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .reduce<Record<string, number>>((acc, [city, count]) => {
        acc[city] = count
        return acc
      }, {})

    return NextResponse.json({
      totalOrders,
      totalCustomers: uniqueCustomers.size,
      totalRevenue,
      pendingRevenue,
      totalAddresses,
      analytics: {
        paymentGateways,
        orderStatuses,
        topCities
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

function normalizeNumber(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}
