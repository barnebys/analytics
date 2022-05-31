import path from "path";
import BigQuery from "@google-cloud/bigquery";
import key from "../../key.json";
// const key = JSON.parse(process.env["GCP_CREDENTIALS"]);

// const key = Buffer.from(process.env.GOOGLE_KEY, "base64").toString();

const { BIGQUERY_DATASET_ID } = process.env;

const { project_id } = key;

const bigquery = BigQuery({
  // projectId: project_id,
  // keyFilename: JSON.parse(Buffer.from(process.env.GOOGLE_KEY, "base64").toString())
  // keyFilename: JSON.parse(process.env["GCP_CREDENTIALS"])
  keyFilename: path.resolve(__dirname, "../../key.json")
});

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
