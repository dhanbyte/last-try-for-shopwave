import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import AdminUser from '@/models/AdminUser'
import AdminOrder from '@/models/AdminOrder'
import mongoose from 'mongoose'

export async function GET() {
  try {
    await dbConnect()
    
    // Get all users from AdminUser (Clerk users)
    const users = await AdminUser.find({}).sort({ createdAt: -1 })
    
    // Get order statistics for each user
    const customersWithStats = await Promise.all(
      users.map(async (user) => {
        // Get orders for this user (try both email and userId)
        const orders = await AdminOrder.find({ 
          $or: [
            { userId: user.email },
            { userId: user.userId }
          ]
        })
        const totalOrders = orders.length
        const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0)
        const lastOrder = orders.length > 0 ? orders[0].createdAt : null
        
        // Calculate status
        const status = totalOrders > 0 ? 'Active' : 'New'
        
        return {
          _id: user._id,
          userId: user.userId, // Clerk user ID
          name: user.fullName,
          email: user.email,
          phone: user.phone || null,
          referralCode: user.referralCode,
          coins: user.coins || 0,
          referredBy: user.referredBy || null,
          isAdmin: user.isAdmin || false,
          totalOrders,
          totalSpent,
          lastOrder,
          status,
          joinedDate: user.createdAt,
          lastActivity: lastOrder || user.updatedAt,
          addresses: user.addresses || []
        }
      })
    )
    
    return NextResponse.json({ 
      success: true, 
      customers: customersWithStats 
    })

  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch customers',
      customers: []
    })
  }
}