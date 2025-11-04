import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Vendor from '@/models/Vendor'

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const { vendorId, newPassword } = await request.json()
    
    if (!vendorId || !newPassword) {
      return NextResponse.json({ 
        success: false, 
        message: 'Vendor ID and new password are required' 
      }, { status: 400 })
    }

    const vendor = await Vendor.findById(vendorId)
    if (!vendor) {
      return NextResponse.json({ 
        success: false, 
        message: 'Vendor not found' 
      }, { status: 404 })
    }

    vendor.password = newPassword
    await vendor.save()

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset successfully' 
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to reset password' 
    }, { status: 500 })
  }
}