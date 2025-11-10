import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI!
const dbName = process.env.MONGODB_DB_NAME || 'photos-test'

let cachedClient: MongoClient | null = null

export async function connectDB() {
  if (cachedClient) {
    return cachedClient.db(dbName)
  }

  try {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    
    await client.connect()
    cachedClient = client
    
    return client.db(dbName)
  } catch (error) {
    console.error('DB connection failed:', error)
    throw error
  }
}