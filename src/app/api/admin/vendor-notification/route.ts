import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import VendorNotification from '@/models/VendorNotification'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { vendorId, title, message, type, data } = await request.json()

    if (!vendorId || !title || !message) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      })
    }

    // Convert vendorId to ObjectId
    const mongoose = require('mongoose')
    const objectId = new mongoose.Types.ObjectId(vendorId)

    // Create notification for specific vendor
    const notification = new VendorNotification({
      vendorId: objectId,
      title,
      message,
      type: type || 'system',
      data: data || {},
      read: false
    })

    await notification.save()

    return NextResponse.json({ 
      success: true, 
      notification 
    })

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create notification' 
    })
  }
}