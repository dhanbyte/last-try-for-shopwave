import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Category from '@/models/Category'

export async function GET() {
  try {
    console.log('🔍 Admin categories API called')
    await dbConnect()
    console.log('✅ Database connected')
    
    // Try direct MongoDB query first
    const mongoose = require('mongoose')
    const db = mongoose.connection.db
    const directCategories = await db.collection('categories').find({}).toArray()
    console.log('📊 Direct query found:', directCategories.length, 'categories')
    
    // Try with Category model
    const categories = await Category.find({}).sort({ order: 1, name: 1 })
    console.log('📊 Model query found:', categories.length, 'categories')
    
    // Use direct query result if model query fails
    const result = categories.length > 0 ? categories : directCategories
    
    return NextResponse.json({ success: true, categories: result })
  } catch (error) {
    console.error('❌ Admin categories API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect()
    const { name, image, subcategories, isActive, order } = await request.json()
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    const category = new Category({
      name,
      slug,
      image,
      subcategories: subcategories || [],
      isActive: isActive !== false,
      order: order || 0
    })
    
    await category.save()
    return NextResponse.json({ success: true, category })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect()
    const { id, name, image, subcategories, isActive, order } = await request.json()
    
    const updateData: any = { updatedAt: new Date() }
    if (name) {
      updateData.name = name
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    if (image) updateData.image = image
    if (subcategories) updateData.subcategories = subcategories
    if (typeof isActive === 'boolean') updateData.isActive = isActive
    if (typeof order === 'number') updateData.order = order
    
    const category = await Category.findByIdAndUpdate(id, updateData, { new: true })
    return NextResponse.json({ success: true, category })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 })
  }
}