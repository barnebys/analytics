const BigQuery = require('@google-cloud/bigquery');
const { parse } = require('url')
const requestIp = require('request-ip')

const key = require('../key.json')

const {project_id} = key
const datasetId = 'tracking'
const schema = "programId:string, lead:boolean, url:string, clientIP:string, userAgent:string, dimension1:string, dimension2:string, dimension3:string, timestamp:datetime"

const bigquery = BigQuery({
    projectId: project_id,
    keyFilename: 'key.json'
});

const options = {
    autoCreate: true,
    schema: schema
}

/**
 * Handles insert streams to Google BigQuery
 *
 * k, kind parameter sets the table to be used
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports = async (req, res) => {
    const { query: { p, k, url, d1, d2, d3, a } } = parse(req.url, true)

    const datetime = BigQuery.datetime(new Date(Date.now()).toISOString());

    // Default event click/impression
    let rows = [
        {
            programId: p,
            url: url,
            lead: false,
            clientIP: requestIp.getClientIp(req),
            userAgent: req.headers['user-agent'],
            dimension1: d1 || '',
            dimension2: d2 || '',
            dimension3: d3 || '',
            timestamp: datetime
        }
    ]

    // Handle leads
    if (req.session.kind && req.session.programId) {
        rows.push({
            programId: req.session.programId,
            url: url,
            lead: true,
            clientIP: requestIp.getClientIp(req),
            userAgent: req.headers['user-agent'],
            dimension1: d1 || '',
            dimension2: d2 || '',
            dimension3: d3 || '',
            timestamp: datetime
        })
    }

    return bigquery
        .dataset(datasetId)
        .table(k)
        .insert(rows, options)
        .then((data) => {
            // const apiResponse = data[0];
        })
        .catch((err) => {
            console.error('ERROR:', err);
            const {insertErrors} = err.response

            if (insertErrors && insertErrors.length > 0) {
                console.log('Insert errors:');
                insertErrors.forEach((err) => console.error(err));
            }
        });

}

