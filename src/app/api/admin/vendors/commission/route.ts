import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Vendor from '@/models/Vendor'

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const { vendorId, commission } = await request.json()

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { 
        commission: Number(commission),
        updatedAt: new Date()
      },
      { new: true }
    )

    if (!vendor) {
      return NextResponse.json({ 
        success: false, 
        error: 'Vendor not found' 
      })
    }

    return NextResponse.json({ 
      success: true, 
      vendor 
    })

  } catch (error) {
    console.error('Error updating commission:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update commission' 
    })
  }
}