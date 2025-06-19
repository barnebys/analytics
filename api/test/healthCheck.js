import { BigQuery } from '@google-cloud/bigquery';
import { connectToDatabase } from '../../lib/mongodb';
import { send } from '../../lib/responseHandler';

export default async function healthHandler(req, res) {
  const {
    MONGODB_URI,
    BIGQUERY_DATASET_ID,
    GCP_CLIENT_EMAIL,
    GCP_CLIENT_PRIVATE_KEY,
    GCP_PROJECT_ID,
  } = process.env;
  const tableName = 'events';

  try {
    const { client, db } = await connectToDatabase();
    
    // Test MongoDB connection by listing collections
    await db.listCollections().toArray();
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    return send(req, res, 500, { msg: 'MongoDB Error: Connection failed' });
  }

  try {
    await new BigQuery({
      credentials: {
        client_email: GCP_CLIENT_EMAIL,
        private_key: GCP_CLIENT_PRIVATE_KEY,
      },
      projectId: GCP_PROJECT_ID,
    })
      .dataset(BIGQUERY_DATASET_ID)
      .table(tableName)
      .getMetadata();
  } catch (error) {
    return send(req, res, 500, {
      msg: 'BigQuery Error:BigQuery connection failed',
    });
  }

  return send(req, res, 200, { msg: 'Ok' });
}
