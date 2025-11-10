import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB_NAME || 'photos-test'

let client: MongoClient
let clientPromise: Promise<MongoClient> | null = null

if (uri) {
  const options = {
    retryWrites: true,
    w: 'majority' as const,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    heartbeatFrequencyMS: 10000,
  }
  
  if (process.env.NODE_ENV === 'development') {
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
} else {
  console.warn('MongoDB URI not found in environment variables')
}

export async function getDatabase(): Promise<Db> {
  if (!uri) {
    console.error('MongoDB URI not found')
    throw new Error('MongoDB URI is required')
  }
  
  if (!clientPromise) {
    console.error('MongoDB client not initialized')
    throw new Error('MongoDB connection not initialized')
  }
  
  try {
    const client = await clientPromise
    const db = client.db(dbName)
    
    // Test connection
    await db.admin().ping()
    console.log('MongoDB connected successfully')
    
    return db
  } catch (error) {
    console.error('MongoDB connection error:', error)
    
    // Retry connection once
    try {
      if (uri) {
        const newClient = new MongoClient(uri, {
          retryWrites: true,
          w: 'majority' as const,
          serverSelectionTimeoutMS: 30000,
        })
        await newClient.connect()
        return newClient.db(dbName)
      }
    } catch (retryError) {
      console.error('MongoDB retry failed:', retryError)
    }
    
    throw new Error(`Failed to connect to MongoDB: ${error}`)
  }
}

export default clientPromise