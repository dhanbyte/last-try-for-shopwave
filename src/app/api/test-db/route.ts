import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
    console.log('DB Name:', process.env.MONGODB_DB_NAME);
    
    const db = await getDatabase();
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      collections: collections.map(c => c.name),
      dbName: db.databaseName
    });
  } catch (error) {
    console.error('MongoDB test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      mongoUri: !!process.env.MONGODB_URI,
      dbName: process.env.MONGODB_DB_NAME
    }, { status: 500 });
  }
}