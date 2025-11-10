const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://dhananjaywin15112004:ec2cY3Gk2HxizdS2@cluster.4jkps.mongodb.net/?retryWrites=true&w=majority&appName=photos-test";

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });
    
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db('photos-test');
    await db.admin().ping();
    console.log('✅ Database ping successful');
    
    // Test collection access
    const collections = await db.listCollections().toArray();
    console.log('✅ Collections found:', collections.length);
    
    await client.close();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();