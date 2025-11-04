import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI;

// Mask credentials for logging (non-production only)
function maskMongoUri(uri?: string | undefined) {
  if (!uri) return 'undefined';
  try {
    // Replace password with **** but keep username and host visible
    // e.g. mongodb://user:pass@host -> mongodb://user:****@host
    return uri.replace(/:\/\/([^:/@]+):([^@]+)@/, '://$1:****@');
  } catch (e) {
    return '****';
  }
}

if (process.env.NODE_ENV !== 'production') {
  try {
    console.log('Using MongoDB URI (masked):', maskMongoUri(MONGODB_URI));
  } catch (e) {
    // avoid crashing if console fails
  }
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Return null if no MongoDB URI is provided
  if (!MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI not found, skipping database connection');
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Keep short timeouts in dev so connection failures are quick
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    };

    // Try primary URI first, then fallback (if provided)
    const primaryUri = MONGODB_URI;
    const fallbackUri = process.env.MONGODB_URI_FALLBACK;

    const tryConnect = async (uri?: string | null) => {
      if (!uri) return null;
      try {
        await mongoose.connect(uri, opts);
        console.log('✅ MongoDB connected successfully to', maskMongoUri(uri));
        return mongoose;
      } catch (e) {
        console.error('❌ MongoDB connection failed for', maskMongoUri(uri), e.message || e);
        return null;
      }
    };

    cached.promise = (async () => {
      // Primary
      let conn = await tryConnect(primaryUri);
      if (conn) return conn;

      // Fallback
      if (fallbackUri && fallbackUri !== primaryUri) {
        console.log('Attempting fallback MongoDB URI (masked):', maskMongoUri(fallbackUri));
        conn = await tryConnect(fallbackUri);
        if (conn) return conn;
      }

      // All attempts failed
      throw new Error('Unable to connect to any configured MongoDB URI');
    })();
  }

  try {
    const conn = await cached.promise;
    cached.conn = conn;
    return conn;
  } catch (e) {
    console.error('❌ MongoDB connection failed:', e);
    cached.promise = null;
    return null;
  }
}

export default dbConnect;
