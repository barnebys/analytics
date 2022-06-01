import path from "path";
// import { client } from "@google-cloud/bigquery";
import {BigQuery} from "@google-cloud/bigquery";
// import key from "../../key.json";
// const key = JSON.parse(process.env["GCP_CREDENTIALS"]);

// const key = Buffer.from(process.env.GOOGLE_KEY, "base64").toString();

const { BIGQUERY_DATASET_ID } = process.env;

// const { project_id, client_email, private_key } = key;

const bigquery = new BigQuery({
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
		private_key: process.env.GCP_CLIENT_PRIVATE_KEY
  },
  projectId: process.env.GCP_PROJECT_ID, 
})

const datasetId = BIGQUERY_DATASET_ID;
const schema = {
  programId: "string",
  url: "string",
  clientIP: "string",
  userAgent: "string",
  category: "string",
  action: "string",
  label: "string",
  value: "string",
  currency: "string",
  source: "string",
  sessionId: "string",
  timestamp: "datetime"
};

const schemaString = Object.entries(schema).reduce(
  (schStr, [columnName, columnType]) => {
    const column = `${columnName}:${columnType}`;
    if (!schStr) {
      return column;
    }
    return `${schStr}, ${column}`;
  },
  ""
);

export default {
  insert: (tableName, rows, timestamp) => {
    const rowsWithTimestamp = rows.map(row => ({
      ...row,
      timestamp: BigQuery.datetime(timestamp)
    }));

    return bigquery
      .dataset(datasetId)
      .table(tableName)
      .insert(rowsWithTimestamp, {
        autoCreate: true,
        schema: schemaString
      });
  }
};
