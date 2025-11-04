import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Category from '@/models/Category'

export async function GET() {
  try {
    await dbConnect()
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 })
    return NextResponse.json({ success: true, categories })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 })
  }
}