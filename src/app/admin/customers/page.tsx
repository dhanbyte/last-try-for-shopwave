'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  Coins,
  Copy,
  Gift,
  Mail,
  Phone,
  Search,
  ShoppingBag,
  Users
} from 'lucide-react'

interface Customer {
  _id: string
  name: string
  email: string
  phone?: string
  referralCode?: string
  referralBalance?: number
  referralCount?: number
  totalOrders: number
  totalSpent: number
  totalEarned?: number
  coins?: number
  isAdmin?: boolean
  status: string
  hasMadePurchase?: boolean
  joinedDate: string
  lastActivity?: string
  lastOrder?: string
}

interface CustomersResponse {
  success: boolean
  customers?: Customer[]
}

const formatCurrency = (value: number | undefined) =>
  `INR ${(value ?? 0).toLocaleString()}`

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    void fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers')
      const data = (await response.json()) as CustomersResponse

      if (data.success && Array.isArray(data.customers)) {
        setCustomers(data.customers)
      } else {
        setCustomers([])
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching customers:', error.message)
      } else {
        console.error('Error fetching customers:', error)
      }
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const copyCustomerInfo = (customer: Customer) => {
    const info = [
      `Customer: ${customer.name}`,
      `Email: ${customer.email}`,
      customer.phone ? `Phone: ${customer.phone}` : '',
      `Referral Code: ${customer.referralCode ?? 'N/A'}`,
      `Total Orders: ${customer.totalOrders}`,
      `Total Spent: ${formatCurrency(customer.totalSpent)}`,
      `Referral Balance: ${formatCurrency(customer.referralBalance)}`,
      `Joined: ${new Date(customer.joinedDate).toLocaleDateString()}`
    ]
      .filter(Boolean)
      .join('\n')

    void navigator.clipboard.writeText(info)
    alert('Customer info copied to clipboard!')
  }

  const filteredCustomers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) {
      return customers
    }

    return customers.filter((customer) => {
      const nameMatch = customer.name?.toLowerCase().includes(query)
      const emailMatch = customer.email?.toLowerCase().includes(query)
      const referralMatch = customer.referralCode?.toLowerCase().includes(query)

      return nameMatch || emailMatch || referralMatch
    })
  }, [customers, searchTerm])

  if (selectedCustomer) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setSelectedCustomer(null)}
            className="text-blue-600 hover:text-blue-800"
          >
            {'< Back to Customers'}
          </button>
          <h1 className="text-3xl font-bold">Customer Details</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6 pb-4 border-b">
            <div>
              <h2 className="text-2xl font-bold">{selectedCustomer.name}</h2>
              <p className="text-gray-600">{selectedCustomer.email}</p>
              <div
                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                  selectedCustomer.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {selectedCustomer.status}
              </div>
            </div>
            <button
              onClick={() => copyCustomerInfo(selectedCustomer)}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              <Copy className="h-4 w-4" />
              Copy Info
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Total Orders</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {selectedCustomer.totalOrders}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">Rs</span>
                <span className="font-medium">Total Spent</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(selectedCustomer.totalSpent)}
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Coins</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {selectedCustomer.coins ?? 0}
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Admin Status</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {selectedCustomer.isAdmin ? 'Admin' : 'Customer'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{selectedCustomer.email}</span>
                </div>
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    Joined: {new Date(selectedCustomer.joinedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Referral Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Referral Code:</span>
                  <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                    {selectedCustomer.referralCode ?? 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Total Earned:</span>
                  <span className="ml-2 text-green-600">
                    {formatCurrency(selectedCustomer.totalEarned)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Purchase Status:</span>
                  <span
                    className={`ml-2 ${
                      selectedCustomer.hasMadePurchase ? 'text-green-600' : 'text-orange-600'
                    }`}
                  >
                    {selectedCustomer.hasMadePurchase ? 'Has made purchase' : 'No purchase yet'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                Last Activity:{' '}
                {selectedCustomer.lastActivity
                  ? new Date(selectedCustomer.lastActivity).toLocaleDateString()
                  : 'N/A'}
              </div>
              {selectedCustomer.lastOrder && (
                <div>
                  Last Order: {new Date(selectedCustomer.lastOrder).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <span className="text-sm text-gray-600">{customers.length} total customers</span>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search customers by name, email, or referral code..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Customer List ({filteredCustomers.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
            <p className="text-gray-600">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No customers found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredCustomers.map((customer) => (
              <button
                key={customer._id}
                type="button"
                className="w-full text-left p-6 hover:bg-gray-50"
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    <p className="text-gray-600">{customer.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{customer.totalOrders} orders</span>
                      <span>{formatCurrency(customer.totalSpent)}</span>
                      <span>{customer.referralCount ?? 0} referrals</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                        {customer.referralCode ?? 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        customer.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {customer.status}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Joined: {new Date(customer.joinedDate).toLocaleDateString()}
                    </p>
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
