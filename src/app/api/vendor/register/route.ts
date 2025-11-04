// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Vendor from '@/models/Vendor'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    console.log('📝 Processing vendor registration...')
    
    const { 
      email, name, businessName, phone, businessType, gstNumber, panNumber, aadharNumber,
      address, bankDetails, profilePhoto, brandName 
    } = await request.json()

    console.log(`🔍 Checking for existing vendor: ${email}`)
    
    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ email }).maxTimeMS(3000).lean()
    if (existingVendor) {
      console.log(`❌ Vendor already exists: ${email} (${existingVendor.status})`)
      
      let errorMessage = 'Email already registered'
      let suggestion = ''

      switch (existingVendor.status) {
        case 'pending':
          errorMessage = 'An account with this email is already registered and pending approval'
          suggestion = 'Please wait for admin approval or contact support if you need assistance.'
          break
        case 'approved':
          errorMessage = 'An account with this email is already active'
          suggestion = 'Please login to your existing account instead of registering again.'
          break
        case 'rejected':
          errorMessage = 'An account with this email was previously rejected'
          suggestion = 'Please contact support for assistance or use a different email.'
          break
        case 'suspended':
          errorMessage = 'An account with this email has been suspended'
          suggestion = 'Please contact support for assistance.'
          break
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        suggestion: suggestion,
        status: existingVendor.status
      })
    }

    // Generate default password and vendorId
    const defaultPassword = 'vendor123'
    const vendorId = 'VND' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase()
    
    console.log(`✨ Creating new vendor: ${businessName} (${email})`)
    
    // Create new vendor with approved status for immediate access
    const vendorData = {
      email,
      password: defaultPassword,
      vendorId,
      name,
      businessName,
      brandName,
      phone,
      businessType: businessType || 'Individual',
      gstNumber,
      panNumber,
      aadharNumber,
      profilePhoto,
      address: address || {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      bankDetails,
      status: 'pending', // Require admin approval
      commission: 15,
      totalEarnings: 0,
      pendingPayments: 0,
      totalRevenue: 0,
      totalProducts: 0,
      totalOrders: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const vendor = new Vendor(vendorData)
    await vendor.save()
    
    console.log(`✅ Vendor created successfully:`)
    console.log(`   - MongoDB ID: ${vendor._id}`)
    console.log(`   - Vendor ID: ${vendor.vendorId}`)
    console.log(`   - Email: ${vendor.email}`)
    console.log(`   - Business: ${vendor.businessName}`)
    console.log(`   - Status: ${vendor.status}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful! Please wait for admin approval before you can login.',
      vendor: {
        _id: vendor._id,
        vendorId: vendor.vendorId,
        email: vendor.email,
        name: vendor.name,
        businessName: vendor.businessName,
        status: vendor.status,
        password: defaultPassword
      }
    })

  } catch (error) {
    console.error('❌ Vendor registration error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Registration failed',
      details: error.message
    }, { status: 500 })
  }
}
