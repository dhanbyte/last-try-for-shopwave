// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Vendor from '@/models/Vendor'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { email } = await request.json()
    console.log(`🔑 Vendor login attempt: ${email}`)

    const vendor = await Vendor.findOne({ email })
      .maxTimeMS(3000)
      .lean()
    
    if (!vendor) {
      console.log(`❌ Vendor not found: ${email}`)
      return NextResponse.json({ 
        success: false, 
        error: 'Vendor not found. Please register first.' 
      })
    }

    console.log(`✅ Vendor found: ${vendor.businessName} (${vendor.status})`)
    
    // Update last login time
    await Vendor.findByIdAndUpdate(
      vendor._id,
      { lastLoginAt: new Date() },
      { maxTimeMS: 2000 }
    )

    return NextResponse.json({ 
      success: true, 
      vendor: {
        _id: vendor._id,
        vendorId: vendor.vendorId || `VND${vendor._id.toString().slice(-8)}`,
        email: vendor.email,
        name: vendor.name,
        businessName: vendor.businessName,
        status: vendor.status,
        password: vendor.password || 'vendor123'
      }
    })

  } catch (error) {
    console.error('❌ Vendor login error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Login failed',
      details: error.message
    }, { status: 500 })
  }
}
