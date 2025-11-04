// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Vendor from '@/models/Vendor'

export async function GET() {
  try {
    await dbConnect()

    // Check what vendor info is in localStorage (this would normally be called from frontend)
    const vendorId = 'check-from-frontend' // This should be localStorage.getItem('vendorId')
    const vendorEmail = 'check-from-frontend' // This should be localStorage.getItem('vendorEmail')

    // Find vendor by different methods
    const vendorById = await Vendor.findOne({ _id: vendorId }).select('email vendorId status brandName')
    const vendorByVendorId = await Vendor.findOne({ vendorId: vendorId }).select('email vendorId status brandName')

    return NextResponse.json({
      success: true,
      message: 'Vendor validation check',
      localStorageCheck: {
        vendorId: vendorId,
        vendorEmail: vendorEmail
      },
      databaseCheck: {
        vendorById: vendorById,
        vendorByVendorId: vendorByVendorId,
        totalVendors: await Vendor.countDocuments()
      },
      recommendations: [
        'Make sure you are logged in as a vendor',
        'Check that vendorId exists in localStorage',
        'Verify vendor account is approved',
        'Try logging out and logging back in'
      ]
    })

  } catch (error) {
    console.error('Error in vendor validation:', error)
    return NextResponse.json({
      success: false,
      message: 'Validation check failed',
      error: error.message
    }, { status: 500 })
  }
}
