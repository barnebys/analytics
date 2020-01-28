import fetch from 'isomorphic-unfetch';
const requestIp = require('request-ip')
const anonymize = require('ip-anonymize')

import NotDeployedError from "../error/NotDeployedError"
import {dataStoreEvent as datastore} from '../datastore'
import queryParser from '../queryParser'


module.exports = async (req, res) => {
    const { 
        fingerprint, refs, programId, url, action, category,
        label, value, currency
    } = queryParser(req.url)

    const now = new Date(Date.now()).toISOString();

    let clientIP = requestIp.getClientIp(req)
    try {
        clientIP = anonymize(clientIP)
    } catch (err) {

    }

    const { 'x-now-deployment-url': nowURL } = req.headers;

    if (!nowURL) {
        throw new NotDeployedError();
    }

    const result = await fetch(`http://${nowURL}/api/reference/fetch?fingerprint=${fingerprint}`);
    const source = result.status === 200 ? 'barnebys' : 'other'

    if (source === 'barnebys') {
        await fetch(`http://${nowURL}/api/reference/create?fingerprint=${fingerprint}&refs=${refs}&clientIP=${clientIP}`);
    }

    const rows = [{
        programId,
        url,
        clientIP,
        userAgent: req.headers && req.headers['user-agent'],
        action,
        category,
        source,
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
