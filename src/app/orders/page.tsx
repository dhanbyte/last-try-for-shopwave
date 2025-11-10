'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuth } from '@/context/ClerkAuthContext'
import { useUser } from '@clerk/nextjs'

type OrderItem = {
  productId: string
  name: string
  price: number
  qty: number
  image?: string
  customName?: string | null
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string

type OrderSummary = {
  id: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  payment: string
  address: {
    fullName: string
    line1: string
    city: string
    pincode: string
  }
  createdAt: string | number | Date
}

type OrdersResponse = {
  success: boolean
  orders: OrderSummary[]
}

export default function OrdersPage() {
  const { user } = useAuth()
  const { user: clerkUser, isLoaded } = useUser()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchOrders = useCallback(async () => {
    try {
      const userId = clerkUser?.id || user?.id
      if (!userId) {
        setOrders([])
        return
      }

      const response = await fetch(`/api/user/orders?userId=${userId}`)
      const data = (await response.json()) as Partial<OrdersResponse>

      if (data?.success && Array.isArray(data.orders)) {
        setOrders(data.orders)
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }, [clerkUser?.id, user?.id])

  useEffect(() => {
    if (isLoaded) {
      if (user?.id || clerkUser?.id) {
        void fetchOrders()
      } else {
        setIsLoading(false)
      }
    }
  }, [user, clerkUser, isLoaded, fetchOrders])

  if (!isLoaded || isLoading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user && !clerkUser) {
    return (
      <div className="card p-8 text-center">
        <h2 className="text-lg font-medium text-gray-700">Please Login</h2>
        <p className="mt-1 text-sm text-gray-500">Login to view your order history.</p>
        <Link
          href="/sign-in"
          className="mt-4 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand/90"
        >
          Go to Login
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Your Orders</h1>
      {!orders.length && (
        <div className="rounded-2xl border bg-white p-8 text-center text-gray-600">
          <h2 className="text-lg font-medium text-gray-700">No orders placed yet.</h2>
          <p className="mt-1 text-sm text-gray-500">When you place an order, it will appear here.</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand/90"
          >
            Continue Shopping
          </Link>
        </div>
      )}
      <div className="space-y-4">
        {orders.map((order) => {
          const createdAt = new Date(order.createdAt)
          const placedOn = Number.isNaN(createdAt.getTime())
            ? null
            : createdAt.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })

          const statusBadge =
            order.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : order.status === 'processing'
              ? 'bg-blue-100 text-blue-800'
              : order.status === 'shipped'
              ? 'bg-purple-100 text-purple-800'
              : order.status === 'delivered'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'

          return (
            <div key={order.id} className="card p-4">
              <div className="mb-2 flex flex-col items-start justify-between border-b pb-2 sm:flex-row sm:items-center">
                <div>
                  <div className="font-semibold">
                    Order <span className="text-brand">#{order.id}</span>
                  </div>
                  {placedOn && (
                    <div className="text-xs text-gray-500">
                      Placed on: {placedOn}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm font-medium sm:mt-0">
                  Total: �,1{order.total.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="mb-3 space-y-2">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 text-sm">
                    <div className="relative h-12 w-12 shrink-0">
                      <Image
                        src={item.image || '/images/placeholder.jpg'}
                        alt={item.name}
                        fill
                        className="rounded-md object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="hover:underline">{item.name}</div>
                      {item.customName && (
                        <div className="mt-1 text-xs font-medium text-blue-600">
                          Custom: &quot;{item.customName}&quot;
                        </div>
                      )}
                      <div className="text-xs text-gray-500">Qty: {item.qty}</div>
                    </div>
                    <div className="text-gray-700">
                      �,1{(item.price * item.qty).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col justify-between border-t pt-2 text-sm sm:flex-row sm:items-start">
                <div className="text-gray-600">
                  <span className="font-medium">Status:</span>
                  <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadge}`}>
                    {order.status}
                  </span>
                  <div className="mt-1 text-xs text-gray-500">
                    Payment: <span className="font-medium">{order.payment}</span>
                  </div>
                </div>
                <div className="mt-2 sm:mt-0 sm:text-right">
                  <div className="font-medium">Deliver to:</div>
                  <div className="text-xs text-gray-500">
                    {order.address.fullName}, {order.address.line1}, {order.address.city}{' '}
                    {order.address.pincode}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
