import _ from 'lodash';
import fetch from 'isomorphic-unfetch';
import requestIp from 'request-ip';
import anonymize from 'ip-anonymize';

import { dataStoreEvent as datastore } from '../datastore';
import queryParser from '../queryParser';

import { queryByFingerprint } from '../../api/reference/fetch';

export default async function event(req, _res) {
  const {
    fingerprint,
    // refs,
    programId,
    url,
    action,
    category,
    label,
    value,
    currency,
  } = queryParser(req.url);

  const now = new Date(Date.now()).toISOString();

  let clientIP = requestIp.getClientIp(req);
  try {
    clientIP = anonymize(clientIP);
  } catch (err) {}

  const source = _.get(await queryByFingerprint(programId, fingerprint), 'type', 'other');

  const rows = [
    {
      programId,
      url,
      clientIP,
      userAgent: req.headers && req.headers['user-agent'],
      action,
      category,
      source,
      sessionId: fingerprint,
      label: label || '',
      value: value || '',
      currency: currency || '',
    },
  ];


  const tableName = 'events';

  return datastore.insert(tableName, rows, now).catch((err) => {
    console.error('ERROR:', err);
    const { insertErrors } = err.response;

    if (insertErrors && insertErrors.length > 0) {
      console.log(`Insert errors [${tableName}]:`);
      insertErrors.forEach((err) => console.error(err));
    }
  });
}
