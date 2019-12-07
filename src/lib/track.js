const BigQuery = require('@google-cloud/bigquery');
const { parse } = require('url')
const requestIp = require('request-ip')
const anonymize = require('ip-anonymize')

const key = require('../key.json')

const { project_id } = key
const datasetId = 'tracking'
const schema = "programId:string, lead:boolean, url:string, clientIP:string, userAgent:string, dimension1:string, dimension2:string, dimension3:string, dimension4:string, dimension5:string, timestamp:datetime"

const bigquery = BigQuery({
    projectId: project_id,
    keyFilename: 'key.json'
});

module.exports = async (req, res) => {
    const { query: { p, k, url, d1, d2, d3, d4, d5, a } } = parse(req.url, true)

    const datetime = BigQuery.datetime(new Date(Date.now()).toISOString());

    let clientIp = requestIp.getClientIp(req)

    try {
        clientIp = anonymize(clientIp)
    } catch (err) {

    }

    // Default event click/impression
    let rows = [
        {
            programId: p,
            url: url,
            lead: false,
            clientIP: clientIp,
            userAgent: req.headers && req.headers['user-agent'],
            dimension1: d1 || '',
            dimension2: d2 || '',
            dimension3: d3 || '',
            dimension4: d4 || '',
            dimension5: d5 || '',
            timestamp: datetime
        }
    ]

    // Handle leads
    if (!a && req.session.kind && req.session.programId && k === req.session.kind) {
        rows.push({
            programId: req.session.programId,
            url: url,
            lead: true,
            clientIP: clientIp,
            userAgent: req.headers && req.headers['user-agent'],
            dimension1: d1 || '',
            dimension2: d2 || '',
            dimension3: d3 || '',
            dimension4: d4 || '',
            dimension5: d5 || '',
            timestamp: datetime
        })

        req.session = null
    }

    return bigquery
        .dataset(datasetId)
        .table(k)
        .insert(rows, {
            autoCreate: true,
            schema: schema
        })
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

