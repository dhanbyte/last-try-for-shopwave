import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import VendorNotification from '@/models/VendorNotification'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!vendorId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Vendor ID required' 
      })
    }

    // Convert vendorId to ObjectId for proper matching
    const mongoose = require('mongoose')
    const objectId = new mongoose.Types.ObjectId(vendorId)

    const notifications = await VendorNotification.find({ vendorId: objectId })
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 20))
      .maxTimeMS(3000)
      .lean()

    return NextResponse.json({ 
      success: true, 
      notifications 
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ 
      success: true,
      notifications: []
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const { notificationId, read } = await request.json()

    await VendorNotification.findByIdAndUpdate(notificationId, { read })

    return NextResponse.json({ 
      success: true 
    })

  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update notification' 
    })
  }
}