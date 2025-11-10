// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Vendor from '@/models/Vendor'

export async function GET() {
  try {
    await dbConnect()

    // Find all vendors without vendorId or with null vendorId
    const vendorsWithoutId = await Vendor.find({
      $or: [
        { vendorId: { $exists: false } },
        { vendorId: null },
        { vendorId: '' }
      ]
    })

    console.log(`Found ${vendorsWithoutId.length} vendors without vendorId`)

    // Generate vendorIds for vendors that don't have them
    for (const vendor of vendorsWithoutId) {
      vendor.vendorId = 'VND' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase()
      await vendor.save()
      console.log(`Generated vendorId ${vendor.vendorId} for vendor ${vendor.email}`)
    }

    // Find all vendors to verify
    const allVendors = await Vendor.find({}, 'email vendorId status brandName').sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      message: `Fixed ${vendorsWithoutId.length} vendors without vendorId`,
      totalVendors: allVendors.length,
      vendorsWithoutId: vendorsWithoutId.length,
      recentVendors: allVendors.slice(0, 5)
    })

  } catch (error) {
    console.error('Error in debug script:', error)
    return NextResponse.json({
      success: false,
      message: 'Debug script failed',
      error: error.message
    }, { status: 500 })
  }
}
