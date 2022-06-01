import { dataStoreEvent } from '../../lib/datastore';
import { send } from 'micro'

export default async function BQHandler(req, res) {
    if (req.method !== 'POST') {
      return send(res, 403, { status: 'error', error: 'method not allowed' });
    }
  
    const now = new Date(Date.now()).toISOString();
    const tableName = 'events';
    const rows = [{
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
        timestamp: now
      }];


    await dataStoreEvent.insert(tableName, rows, now).catch((err) => {
      console.error('ERROR:', err);
      const { insertErrors } = err.response;
  
      if (insertErrors && insertErrors.length > 0) {
        console.log('Insert errors:');
        insertErrors.forEach((err) => console.error(err));
      }
    }).then(abc=>{
      console.log('Inserted');
    });
  
    return send(res, 200, {'message': "OK"});
  }