// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/dbConnect'
import Vendor from '@/models/Vendor'

const JWT_SECRET = process.env.JWT_SECRET || 'vendor-secret-key-2024'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    await dbConnect()
    const vendor = await Vendor.findOne({ email }).lean()
    
    if (!vendor || vendor.status !== 'approved') {
      return NextResponse.json({ success: false, error: 'Invalid credentials or not approved' })
    }
    
    const token = jwt.sign(
      { vendorId: vendor._id, email: vendor.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    )
    
    const response = NextResponse.json({
      success: true,
      vendor: {
        _id: vendor._id,
        email: vendor.email,
        businessName: vendor.businessName,
        brandName: vendor.brandName,
        companyName: vendor.companyName,
        status: vendor.status
      }
    })
    
    response.cookies.set('vendor-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/'
    })
    
    return response
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Login failed' })
  }
}

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('vendor-token')?.value
    
    if (!token) {
      return NextResponse.json({ success: false, error: 'No session' })
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    await dbConnect()
    const vendor = await Vendor.findById(decoded.vendorId).lean()
    
    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor not found' })
    }
    
    return NextResponse.json({
      success: true,
      vendor: {
        _id: vendor._id,
        email: vendor.email,
        businessName: vendor.businessName,
        brandName: vendor.brandName,
        companyName: vendor.companyName,
        status: vendor.status
      }
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid session' })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('vendor-token')
  return response
}
