// Quick connectivity test script. Loads .env.local and attempts to connect with mongodb driver.
// Usage: (install dotenv first) `pnpm add -D dotenv` then `node ./test-mongo.js`
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

(async () => {
  const uri = process.env.MONGODB_URI;
  const mask = (u) => {
    if (!u) return 'undefined';
    try { return u.replace(/:\/\/([^:/@]+):([^@]+)@/, '://$1:****@'); } catch { return '****'; }
  };

  console.log('Using URI (masked):', mask(uri));
  if (!uri) {
    console.error('MONGODB_URI is not defined. Ensure .env.local is present and contains MONGODB_URI.');
    process.exit(2);
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    console.log('Connected OK to MongoDB');
    const dbName = process.env.MONGODB_DB_NAME || 'admin';
    const ping = await client.db(dbName).command({ ping: 1 });
    console.log('Ping result:', ping);
  } catch (e) {
    console.error('Connection error:', e);
    process.exitCode = 1;
  } finally {
    try { await client.close(); } catch (e) {}
  }
})();
