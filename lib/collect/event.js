const requestIp = require('request-ip')
const anonymize = require('ip-anonymize')
import {dataStoreEvent as datastore} from '../datastore'
import {queryParserEvent as queryParser} from '../queryParser'

module.exports = async (req, res) => {
    const { 
        programId, sessionId, locale, url, action, category,
        label, value, currency
    } = queryParser(req.url)

    const now = new Date(Date.now()).toISOString();

    let clientIP = requestIp.getClientIp(req)
    try {
        clientIP = anonymize(clientIP)
    } catch (err) {

    }

    const rows = [{
        programId,
        sessionId: sessionId || '',
        locale: locale || '',
        url,
        clientIP,
        userAgent: req.headers && req.headers['user-agent'],
        action,
        category,
        label: label || '',
        value: value || '',
        currency: currency || '',
    }]

    const tableName = "events"

    return datastore
        .insert(tableName, rows, now)
        .catch((err) => {
            console.error('ERROR:', err);
            const {insertErrors} = err.response

            if (insertErrors && insertErrors.length > 0) {
                console.log('Insert errors:');
                insertErrors.forEach((err) => console.error(err));
            }
        });
}
