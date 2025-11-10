'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react'

type Transaction = {
  orderId: string
  date: string
  amount: number
  status: string
}

type EarningsData = {
  totalEarnings: number
  pendingPayments: number
  thisMonth: number
  lastMonth: number
  transactions: Transaction[]
}

const EMPTY_EARNINGS: EarningsData = {
  totalEarnings: 0,
  pendingPayments: 0,
  thisMonth: 0,
  lastMonth: 0,
  transactions: [],
}

export default function Earnings() {
  const [earnings, setEarnings] = useState<EarningsData>(EMPTY_EARNINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    try {
      const vendorDataStr = localStorage.getItem('vendorData')
      let vendorId: string | null = null

      if (vendorDataStr) {
        try {
          const vendorData = JSON.parse(vendorDataStr) as { _id?: string; id?: string }
          vendorId = vendorData._id ?? vendorData.id ?? null
        } catch (error) {
          console.error('Error parsing vendor data:', error)
        }
      }

      if (!vendorId) {
        window.location.href = '/vendor/login'
        return
      }

      const response = await fetch(`/api/vendor/earnings?vendorId=${vendorId}`)
      const data = await response.json()

      if (data.success && typeof data.earnings === 'object') {
        const source = data.earnings as Partial<EarningsData>
        const transactions = Array.isArray(source.transactions)
          ? source.transactions
              .map((item) => {
                if (
                  item &&
                  typeof item === 'object' &&
                  typeof item.orderId === 'string' &&
                  typeof item.date === 'string' &&
                  typeof item.amount === 'number' &&
                  typeof item.status === 'string'
                ) {
                  return item as Transaction
                }
                return null
              })
              .filter(Boolean) as Transaction[]
          : []

        setEarnings({
          totalEarnings: Number(source.totalEarnings) || 0,
          pendingPayments: Number(source.pendingPayments) || 0,
          thisMonth: Number(source.thisMonth) || 0,
          lastMonth: Number(source.lastMonth) || 0,
          transactions,
        })
      } else {
        console.error('Earnings fetch error:', data.message)
      }
    } catch (error) {
      console.error('Error fetching earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-1/4 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="rounded-lg bg-white p-6 shadow">
                <div className="mb-2 h-4 rounded bg-gray-200" />
                <div className="h-8 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <DollarSign className="h-8 w-8" />
          Earnings Dashboard
        </h1>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          <Download className="h-4 w-4" />
          Download Report
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatsCard label="Total Earnings" value={earnings.totalEarnings} icon={<DollarSign className="h-8 w-8 text-green-500" />} />
        <StatsCard label="Pending Payments" value={earnings.pendingPayments} icon={<Calendar className="h-8 w-8 text-yellow-500" />} color="text-yellow-600" />
        <StatsCard label="This Month" value={earnings.thisMonth} icon={<TrendingUp className="h-8 w-8 text-blue-500" />} color="text-blue-600" />
        <StatsCard label="Last Month" value={earnings.lastMonth} icon={<Calendar className="h-8 w-8 text-purple-500" />} color="text-purple-600" />
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
        </div>

        {earnings.transactions.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-xl font-medium text-gray-900">No transactions yet</h3>
            <p className="text-gray-500">Earnings will appear here when you make sales</p>
          </div>
        ) : (
          <div className="divide-y">
            {earnings.transactions.map((transaction) => (
              <div key={transaction.orderId} className="flex items-center justify-between p-6">
                <div>
                  <h3 className="font-medium">Order #{transaction.orderId}</h3>
                  <p className="text-sm text-gray-600">
                    {transaction.date ? new Date(transaction.date).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+₹{transaction.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{transaction.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatsCard({
  label,
  value,
  icon,
  color = 'text-green-600',
}: {
  label: string
  value: number
  icon: React.ReactNode
  color?: string
}) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>₹{value.toLocaleString()}</p>
        </div>
        {icon}
      </div>
    </div>
  )
}
