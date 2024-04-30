import {BigQuery} from "@google-cloud/bigquery";

const { BIGQUERY_DATASET_ID } = process.env;

const bigquery = new BigQuery({
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
		private_key: process.env.GCP_CLIENT_PRIVATE_KEY
  },
  projectId: process.env.GCP_PROJECT_ID, 
})

const datasetId = BIGQUERY_DATASET_ID;
const schema = {
  programId: 'string',
  lead: 'boolean',
  url: 'string',
  clientIP: 'string',
  userAgent: 'string',
  dimension1: 'string',
  dimension2: 'string',
  dimension3: 'string',
  dimension4: 'string',
  dimension5: 'string',
  isSponsored: 'boolean',
  dealType: 'string',
  timestamp: 'datetime',
};
const schemaString = Object.entries(schema).reduce(
  (schStr, [columnName, columnType]) => {
    const column = `${columnName}:${columnType}`;
    if (!schStr) {
      return column;
    }
    return `${schStr}, ${column}`;
  },
  ''
);

export default {
  insert: (tableName, rows, timestamp) => {
    const rowsWithTimestamp = rows.map((row) => ({
      ...row,
      timestamp: BigQuery.datetime(timestamp),
    }));

    return bigquery
      .dataset(datasetId)
      .table(tableName)
      .insert(rowsWithTimestamp, {
        autoCreate: true,
        schema: schemaString,
      });
  },
};
