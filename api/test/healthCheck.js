import { BigQuery } from '@google-cloud/bigquery';
import faunadb, { query as q } from 'faunadb';
import requestIp from 'request-ip';
import { send } from '../../lib/responseHandler';

export default async function healthHandler(req, res) {
  console.log(req.headers['X-Forwarded-For']);

  return send(req, res, 200, {
      msg: req.headers,
    });
    
    //   let clientIP = JSON.stringify(requestIp.getClientIpFromXForwardedFor(req));
  const { FAUNADB_SECRET: secret } = process.env;
  const {
    BIGQUERY_DATASET_ID,
    GCP_CLIENT_EMAIL,
    GCP_CLIENT_PRIVATE_KEY,
    GCP_PROJECT_ID,
  } = process.env;
  const tableName = 'events';

  try {
    await new faunadb.Client({ secret })
      .query(q.Paginate(q.Collections()))
      .catch((err) => {
        throw Error('FaunaDB Error: ' + err.message);
      });
  } catch (error) {
    console.error('FaunaDB connection failed');
    return send(req, res, 500, { msg: 'FaunaDB Error' });
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
