import {BigQuery} from "@google-cloud/bigquery";
import faunadb, { query as q }  from 'faunadb';
import { send } from 'micro'

export default async function healthHandler(req, res) {
    
    const { FAUNADB_SECRET: secret } = process.env;
    const { BIGQUERY_DATASET_ID, GCP_CLIENT_EMAIL, GCP_CLIENT_PRIVATE_KEY, GCP_PROJECT_ID } = process.env;
    const tableName = 'events';

    try {
        await new faunadb.Client({ secret })
        .query(
            q.Paginate(q.Collections())
        )
        .catch((err) => { 
            throw Error('FaunaDB Error: ' + err.message);
        })

    } catch (error) {
        console.error('FaunaDB connection failed');
        return send(res, 500, { msg: 'FaunaDB Error' })
    }
    
    try {
        await new BigQuery({
            credentials: {
                client_email: GCP_CLIENT_EMAIL,
                    private_key: GCP_CLIENT_PRIVATE_KEY
            },
            projectId: GCP_PROJECT_ID
        })
        .dataset(BIGQUERY_DATASET_ID)
        .table(tableName)
        .getMetadata();

    } catch (error) {
        console.error('BigQuery connection failed');
        return send(res, 500, { msg: 'BigQuery Error' })
    }

    return send(res, 200, { msg: 'Ok' })
}