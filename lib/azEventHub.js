const { EventHubProducerClient } = require('@azure/event-hubs');

export async function pushToAzureEventHub(req) {
  const { EVENTHUB_CONNECTION_STRING, EVENTHUB_NAME } = process.env;

  console.log('Request Body: ' + JSON.stringify(req.query));

  const producer = new EventHubProducerClient(
    EVENTHUB_CONNECTION_STRING,
    EVENTHUB_NAME
  );

  const batch = await producer.createBatch();

  batch.tryAdd({ body: req.query });

  await producer.sendBatch(batch);

  await producer.close();
}
