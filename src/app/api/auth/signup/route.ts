import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import { generateToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { email, password, fullName } = await request.json()
    
    if (!email || !password || !fullName) {
      return NextResponse.json({ 
        error: 'Email, password and full name required' 
      }, { status: 400 })
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ 
        error: 'User already exists' 
      }, { status: 409 })
    }
    
    // Create new user
    const newUser = new User({
      email,
      password, // Will be hashed by pre-save middleware
      name: fullName,
      referralCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
      referralBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      hasMadePurchase: false,
      referralCount: 0
    })
    
    await newUser.save()
    
    // Generate token
    const token = generateToken(newUser._id)
    
    return NextResponse.json({ 
      success: true,
      token,
      data: { 
        user: {
          id: newUser._id,
          email: newUser.email,
          fullName: newUser.name,
          referralCode: newUser.referralCode,
          createdAt: newUser.createdAt
        }
      }
    })
    
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ 
      error: 'Registration failed' 
    }, { status: 500 })
  }
}