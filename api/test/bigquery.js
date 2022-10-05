import { dataStoreEvent } from '../../lib/datastore';
import { send } from '../../lib/responseHandler';

export default async function BQHandler(req, res) {
    if (req.method !== 'POST') {
      return send(req, res, 403, { status: 'error', error: 'method not allowed' });
    }
  
    const now = new Date(Date.now()).toISOString();
    const tableName = 'events';
    const rows = [{
        programId: "dev_test",
        url: "dev_test",
        clientIP: "dev_test",
        userAgent: "dev_test",
        category: "dev_test",
        action: "dev_test",
        label: "dev_test",
        value: "dev_test",
        currency: "dev_test",
        source: "dev_test",
        sessionId: "dev_test",
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
  
    return send(req, res, 200, {'message': "OK"});
  }