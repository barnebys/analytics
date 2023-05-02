import _ from 'lodash';
import { queryByFingerprintAndRef } from '../reference/fetch';
import { send } from '../../lib/responseHandler';
import { json } from 'micro';

import { dataStoreEvent } from '../../lib/datastore';

const getEvents = async (req) => {
  const events = await json(req);
  return await Promise.all(
    events.map(async (event) => {
      return queryByFingerprintAndRef(event.ref, event.programId).then(
        async (res) => {
          const { data, error } = await res.json();
          return {
            data: {
              programId: event.programId,
              url: '',
              clientIP: _.get(data, 'clientIP', ''),
              userAgent: _.get(data, 'userAgent', ''),
              sessionId: _.get(data, 'fingerprint', ''),
              action: event.eventAction,
              category: event.eventCategory,
              source: _.get(data, 'source', 'unkown'),
              label: event.eventLabel || '',
              value: event.eventValue || '',
              currency: event.eventCurrency || '',
            },
            ref: event.ref,
            status: res.status,
            error: error || '',
          };
        }
      );
    })
  );
};

export default async function collectHandler(req, res) {
  if (req.method !== 'POST') {
    return send(req, res, 403, { status: 'error', error: 'method not allowed' });
  }
  // todo check for mandatory values

  const now = new Date(Date.now()).toISOString();

  const events = await getEvents(req);
  const rows = events.reduce((acc, cur) => acc.concat(cur.data), []);

  const response = events.reduce(
    (acc, cur) =>
      acc.concat({
        status: cur.status === 200 ? 'hit' : 'miss',
        programId: _.get(cur, 'data.programId'),
        ref: _.get(cur, 'ref'),
        source: _.get(cur, 'data.source', 'other'),
        error: cur.error,
      }),
    []
  );

  const tableName = 'events';

  await dataStoreEvent.insert(tableName, rows, now).catch((err) => {
    console.error('ERROR:', err);
    const { insertErrors } = err.response;

    if (insertErrors && insertErrors.length > 0) {
      console.log(`Insert errors [${tableName}]:`);
      insertErrors.forEach((err) => console.error(err));
    }
  });

  return send(req, res, 201, { status: 'ok', data: response });
}
