// @ts-nocheck
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import VendorProduct from '@/models/VendorProduct'

export async function GET() {
  try {
    await dbConnect()
    
    // Get all vendor products with their status
    const allVendorProducts = await VendorProduct.find({}).lean()
    const activeVendorProducts = await VendorProduct.find({ status: 'active' }).lean()
    
    return NextResponse.json({
      success: true,
      totalVendorProducts: allVendorProducts.length,
      activeVendorProducts: activeVendorProducts.length,
      allProducts: allVendorProducts.map(p => ({
        id: p._id.toString(),
        name: p.name,
        status: p.status,
        vendorId: p.vendorId,
        price: p.price,
        stock: p.stock
      })),
      activeProducts: activeVendorProducts.map(p => ({
        id: p._id.toString(),
        name: p.name,
        status: p.status,
        vendorId: p.vendorId,
        price: p.price,
        stock: p.stock
      }))
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}
