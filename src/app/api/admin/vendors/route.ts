// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Vendor from '@/models/Vendor'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function GET() {
  try {
    await dbConnect()
    console.log('🔍 Fetching vendors from database...')
    
    const vendors = await Vendor.find({})
      .sort({ createdAt: -1 })
      .maxTimeMS(5000)
      .lean()
    
    console.log(`✅ Found ${vendors.length} vendors`)
    
    // Ensure all vendors have required fields
    const processedVendors = vendors.map(vendor => ({
      ...vendor,
      vendorId: vendor.vendorId || `VND${vendor._id.toString().slice(-8)}`,
      password: vendor.password || 'vendor123',
      commission: vendor.commission || 15,
      totalEarnings: vendor.totalEarnings || 0,
      totalProducts: vendor.totalProducts || 0,
      totalOrders: vendor.totalOrders || 0,
      totalRevenue: vendor.totalRevenue || 0,
      address: vendor.address || {
        street: 'Not provided',
        city: 'Not provided', 
        state: 'Not provided',
        pincode: '000000'
      }
    }))
    
    return NextResponse.json({ 
      success: true, 
      vendors: processedVendors,
      count: processedVendors.length
    })

  } catch (error) {
    console.error('❌ Error fetching vendors:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch vendors',
      details: error.message
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const { vendorId, status } = await request.json()
    console.log(`🔄 Updating vendor ${vendorId} status to ${status}`)

    const updateData = { 
      status,
      updatedAt: new Date()
    }
    
    if (status === 'approved') {
      updateData.approvedAt = new Date()
      updateData.approvedBy = 'admin'
    }

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      updateData,
      { new: true, maxTimeMS: 3000 }
    )

    if (!vendor) {
      console.log(`❌ Vendor not found: ${vendorId}`)
      return NextResponse.json({ 
        success: false, 
        error: 'Vendor not found' 
      }, { status: 404 })
    }

    console.log(`✅ Vendor ${vendorId} updated to ${status}`)
    return NextResponse.json({ 
      success: true, 
      vendor,
      message: `Vendor ${status} successfully`
    })

  } catch (error) {
    console.error('❌ Error updating vendor:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update vendor',
      details: error.message
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()
    
    const { vendorId } = await request.json()
    console.log(`🗑️ Deleting vendor ${vendorId}`)

    const vendor = await Vendor.findByIdAndDelete(vendorId)

    if (!vendor) {
      return NextResponse.json({ 
        success: false, 
        error: 'Vendor not found' 
      }, { status: 404 })
    }

    console.log(`✅ Vendor ${vendorId} deleted successfully`)
    return NextResponse.json({ 
      success: true, 
      message: 'Vendor deleted successfully'
    })

  } catch (error) {
    console.error('❌ Error deleting vendor:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete vendor'
    }, { status: 500 })
  }
}
