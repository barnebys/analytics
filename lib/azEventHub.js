const { EventHubProducerClient } = require('@azure/event-hubs');
import requestIp from 'request-ip';

import queryParser from './queryParser';

export async function pushToAzureEventHub(req) {
  const { EVENTHUB_CONNECTION_STRING, EVENTHUB_NAME } = process.env;

  try {
    const {
      programId,
      kind,
      affiliate,
      url,
      dimension1,
      dimension2,
      dimension3,
      dimension4,
      dimension5,
      isSponsored,
    } = queryParser(req.url);

    const allowedActions = ['impression', 'click'];

    if (!allowedActions.includes(kind)) return false;

    let clientIP = requestIp.getClientIp(req);
    try {
      clientIP = anonymize(clientIP);
    } catch (err) {}

    // Default event click/impression
    let data = [
      {
        kind,
        affiliate,
        programId,
        url,
        lead: false,
        clientIP,
        userAgent: req.headers && req.headers['user-agent'],
        dimension1: dimension1 || '',
        dimension2: dimension2 || '',
        dimension3: dimension3 || '',
        dimension4: dimension4 || '',
        dimension5: dimension5 || '',
        isSponsored: isSponsored === '1',
      },
    ];

    console.log('Request Body: ' + JSON.stringify(data));

    if (data && Object.keys(data).length !== 0) {
      const producer = new EventHubProducerClient(
        EVENTHUB_CONNECTION_STRING,
        EVENTHUB_NAME
      );

      const batch = await producer.createBatch();
      batch.tryAdd({ body: req.query });

      await producer.sendBatch(batch);
      await producer.close();
    }
  } catch (error) {
    console.log('Error: ', error);
  }
}
