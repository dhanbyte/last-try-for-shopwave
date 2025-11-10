import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDatabase } from '@/lib/db'

interface UserDocument {
  _id: ObjectId | string
  email?: string
  emailAddress?: string
  full_name?: string
  fullName?: string
  firstName?: string
  lastName?: string
  phone?: string
  created_at?: string
  createdAt?: string
  last_login?: string
  lastLogin?: string
}

interface UserDataDocument<T = unknown> {
  type: string
  data?: T
}

interface CartItem {
  price?: number | string
  quantity?: number | string
}

interface OrderRecord {
  total?: number | string
  status?: string
  paymentMethod?: string
  createdAt?: string
  orderDate?: string
  [key: string]: unknown
}

type Context = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: Context) {
  const { id } = await context.params

  try {
    const db = await getDatabase()

    const { userDoc, userId } = await resolveUser(db, id)

    if (!userDoc) {
      const users = await db.collection<UserDocument>('users').find({}).limit(5).toArray()
      return NextResponse.json(
        {
          error: 'User not found',
          availableUsers: users.map((candidate) => ({
            id: extractId(candidate),
            email: candidate.email ?? candidate.emailAddress ?? 'No email'
          })),
          totalUsers: await db.collection('users').countDocuments()
        },
        { status: 404 }
      )
    }

    const response = await buildUserResponse(db, userId, userDoc)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 })
  }
}

async function resolveUser(db: Awaited<ReturnType<typeof getDatabase>>, id: string) {
  if (id === 'first') {
    const firstUser = await db.collection<UserDocument>('users').findOne({})
    if (!firstUser) {
      return { userDoc: null, userId: '' as const }
    }
    return { userDoc: firstUser, userId: extractId(firstUser) }
  }

  const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id }
  const userDoc = await db.collection<UserDocument>('users').findOne(query)

  return { userDoc, userId: userDoc ? extractId(userDoc) : id }
}

async function buildUserResponse(
  db: Awaited<ReturnType<typeof getDatabase>>,
  userId: string,
  userDoc: UserDocument
) {
  const userData = await db
    .collection<UserDataDocument>('user_data')
    .find({ userId })
    .toArray()

  const cart = getArray<CartItem>(userData, 'cart')
  const wishlist = getArray<unknown>(userData, 'wishlist')
  const addresses = getArray<unknown>(userData, 'addresses')
  const orders = getArray<OrderRecord>(userData, 'orders')
  const paymentMethods = getArray<unknown>(userData, 'payment_methods')

  const totalSpent = orders.reduce((sum, order) => sum + normalizeNumber(order.total), 0)
  const ordersByStatus = orders.reduce<Record<string, number>>((acc, order) => {
    const status = typeof order.status === 'string' ? order.status : 'Unknown'
    acc[status] = (acc[status] ?? 0) + 1
    return acc
  }, {})
  const paymentGatewayUsage = orders.reduce<Record<string, number>>((acc, order) => {
    if (typeof order.paymentMethod === 'string' && order.paymentMethod.length > 0) {
      acc[order.paymentMethod] = (acc[order.paymentMethod] ?? 0) + 1
    }
    return acc
  }, {})

  const sortedOrders = [...orders].sort((a, b) => {
    const aDate = new Date((a.createdAt ?? a.orderDate) as string).getTime()
    const bDate = new Date((b.createdAt ?? b.orderDate) as string).getTime()
    return bDate - aDate
  })

  return {
    user: {
      id: userId,
      email: userDoc.email ?? userDoc.emailAddress ?? null,
      fullName:
        userDoc.full_name ??
        userDoc.fullName ??
        (userDoc.firstName ? `${userDoc.firstName} ${userDoc.lastName ?? ''}`.trim() : null),
      phone: userDoc.phone ?? null,
      createdAt: userDoc.created_at ?? userDoc.createdAt ?? null,
      lastLogin: userDoc.last_login ?? userDoc.lastLogin ?? null
    },
    data: {
      cart: {
        count: cart.length,
        items: cart,
        totalValue: cart.reduce(
          (sum, item) => sum + normalizeNumber(item.price) * normalizeNumber(item.quantity, 1),
          0
        )
      },
      wishlist: {
        count: wishlist.length,
        items: wishlist
      },
      addresses: {
        count: addresses.length,
        list: addresses
      },
      orders: {
        count: orders.length,
        list: sortedOrders,
        totalSpent,
        byStatus: ordersByStatus
      },
      paymentMethods: {
        saved: paymentMethods,
        gatewayUsage: paymentGatewayUsage
      }
    },
    analytics: {
      totalSpent,
      averageOrderValue: orders.length > 0 ? totalSpent / orders.length : 0,
      orderFrequency: orders.length,
      favoritePaymentMethod:
        Object.entries(paymentGatewayUsage).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'None'
    }
  }
}

function extractId(user: UserDocument): string {
  return typeof user._id === 'string' ? user._id : user._id.toString()
}

function getArray<T>(documents: UserDataDocument[], type: string): T[] {
  const entry = documents.find((doc) => doc.type === type)
  return Array.isArray(entry?.data) ? (entry?.data as T[]) : []
}

function normalizeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  return fallback
}
