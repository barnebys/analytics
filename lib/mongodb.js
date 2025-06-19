const { MongoClient } = require('mongodb');

const { MONGODB_URI, MONGODB_DB } = process.env;

if (!MONGODB_URI) {
  console.error('MongoDB Error: Missing connection URI');
}

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  // If we have the cached connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // If no cached connection, create a new one
  const client = await MongoClient.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = client.db(MONGODB_DB);

  // Cache the client and db connections
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

module.exports = {
  connectToDatabase,
  getCachedClient: () => cachedClient,
  getCachedDb: () => cachedDb,
};
