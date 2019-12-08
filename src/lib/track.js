const requestIp = require('request-ip')
const anonymize = require('ip-anonymize')
const datastore = require('./datastore')
const queryParser = require('./queryParser')

module.exports = async (req, res) => {
    const { 
	programId, kind, affiliate, url,
	d1, d2, d3, d4, d5,
    } = queryParser(req.url)

    const now = new Date(Date.now()).toISOString();

    let clientIp = requestIp.getClientIp(req)
    try {
        clientIp = anonymize(clientIp)
    } catch (err) {

    }

    // Default event click/impression
    let rows = [{
        programId,
        url,
        lead: false,
        clientIP: clientIp,
        userAgent: req.headers && req.headers['user-agent'],
        dimension1: d1 || '',
        dimension2: d2 || '',
        dimension3: d3 || '',
        dimension4: d4 || '',
        dimension5: d5 || '',
    }]

    // Handle leads
    if (!affiliate && req.session.kind && req.session.programId && kind === req.session.kind) {
        rows.push({
            programId: req.session.programId,
            url,
            lead: true,
            clientIP: clientIp,
            userAgent: req.headers && req.headers['user-agent'],
            dimension1: d1 || '',
            dimension2: d2 || '',
            dimension3: d3 || '',
            dimension4: d4 || '',
            dimension5: d5 || '',
        })

        req.session = null
    }

    return datastore
        .insert(rows, now)
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
