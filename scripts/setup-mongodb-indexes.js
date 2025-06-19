const { connectToDatabase } = require('../lib/mongodb');

async function setupIndexes() {
  try {
    console.log('Setting up MongoDB indexes...');
    const { db } = await connectToDatabase();
    const references = db.collection('references');
    
    // Create indexes for common queries
    await references.createIndex({ programId: 1, fingerprint: 1 });
    await references.createIndex({ programId: 1, refs: 1 });
    await references.createIndex({ fingerprint: 1 });
    await references.createIndex({ refs: 1 });
    await references.createIndex({ type: 1 });
    
    console.log('MongoDB indexes created successfully');
  } catch (error) {
    console.error('Failed to create MongoDB indexes:', error);
  } finally {
    process.exit(0);
  }
}

setupIndexes().catch(console.error);
