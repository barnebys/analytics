const BigQuery = require('@google-cloud/bigquery');
const key = require('../key.json')

const { project_id } = key
const bigquery = BigQuery({
    projectId: project_id,
    keyFilename: 'key.json'
});

const datasetId = 'tracking'
const schema = "programId:string, lead:boolean, url:string, clientIP:string, userAgent:string, dimension1:string, dimension2:string, dimension3:string, dimension4:string, dimension5:string, timestamp:datetime"

module.exports = {
    insert: (rows, timestamp) => {
        const rowsWithTimestamp = rows.map(row => ({
            ...row,
            timestamp: BigQuery.datetime(timestamp),
        }))

        return bigquery
            .dataset(datasetId)
            .table(k)
            .insert(rowsWithTimestamp, {
                autoCreate: true,
                schema: schema
            })
    }
}
