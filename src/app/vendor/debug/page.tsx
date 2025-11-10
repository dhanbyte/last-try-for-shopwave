'use client'

import { useEffect, useState } from 'react'

type DebugSection = {
  localStorage: { vendorEmail: string | null; vendorId: string | null }
  profile: unknown
  stats: Record<string, unknown> | null
  orders: Record<string, unknown> | null
  notifications: Record<string, unknown> | null
  products: Record<string, unknown> | null
  error?: string
}

export default function VendorDebugPage() {
  const [debugData, setDebugData] = useState<DebugSection | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const loadDebugData = async () => {
      const vendorEmail = localStorage.getItem('vendorEmail')
      const vendorId = localStorage.getItem('vendorId')
      
      const data: DebugSection = {
        localStorage: { vendorEmail, vendorId },
        profile: null,
        stats: null,
        orders: null,
        notifications: null,
        products: null
      }

      if (vendorEmail) {
        try {
          // Fetch vendor profile
          const profileRes = await fetch(`/api/vendor/profile?email=${vendorEmail}`)
          const profileData = await profileRes.json()
          data.profile = profileData

          if (profileData.success && profileData.vendor) {
            const realVendorId = profileData.vendor._id

            // Fetch stats
            try {
              console.log('Fetching stats with vendorId:', realVendorId)
              const statsRes = await fetch(`/api/vendor/stats?vendorId=${realVendorId}`)
              const statsJson = await statsRes.json()
              data.stats = { ...statsJson, requestedVendorId: realVendorId }
            } catch (e) {
              const message = e instanceof Error ? e.message : String(e)
              data.stats = { error: message }
            }

            // Fetch orders
            try {
              const ordersRes = await fetch(`/api/vendor/orders?vendorId=${realVendorId}&limit=5`)
              data.orders = await ordersRes.json()
            } catch (e) {
              const message = e instanceof Error ? e.message : String(e)
              data.orders = { error: message }
            }

            // Fetch notifications
            try {
              const notifRes = await fetch(`/api/vendor/notifications?vendorId=${realVendorId}&limit=5`)
              data.notifications = await notifRes.json()
            } catch (e) {
              const message = e instanceof Error ? e.message : String(e)
              data.notifications = { error: message }
            }

            // Fetch products
            try {
              console.log('Fetching products with vendorId:', realVendorId)
              const productsRes = await fetch(`/api/vendor/products?vendorId=${realVendorId}`)
              const productsJson = await productsRes.json()
              data.products = { ...productsJson, requestedVendorId: realVendorId }
            } catch (e) {
              const message = e instanceof Error ? e.message : String(e)
              data.products = { error: message }
            }
          }
        } catch (error) {
          data.error = error instanceof Error ? error.message : String(error)
        }
      }

      setDebugData(data)
      setLoading(false)
    }

    loadDebugData()
  }, [])

  const createTestOrder = async () => {
    if (!debugData?.profile || typeof debugData.profile !== 'object') {
      alert('No vendor ID found')
      return
    }

    const vendorId = (debugData.profile as Record<string, any>)?.vendor?._id
    if (typeof vendorId !== 'string') {
      alert('No vendor ID found')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/test-vendor-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId }),
      })

      const result = await response.json()
      if (result.success) {
        alert('Test order created! Refresh to see updated stats.')
        window.location.reload()
      } else {
        alert('Failed to create test order: ' + result.message)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      alert('Error creating test order: ' + message)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading debug data...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vendor Debug Information</h1>
        <button
          onClick={createTestOrder}
          disabled={
            creating ||
            !debugData?.profile ||
            typeof (debugData.profile as Record<string, any>)?.vendor?._id !== 'string'
          }
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Create Test Order'}
        </button>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">LocalStorage Data</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(debugData?.localStorage, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Vendor Profile</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(debugData?.profile, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Stats API Response</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(debugData?.stats, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Orders API Response</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(debugData?.orders, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Notifications API Response</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(debugData?.notifications, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Products API Response</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(debugData?.products, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
