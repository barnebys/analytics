import { router, get, post } from 'microrouter';
import { send } from 'micro';

// import { TelemetryClient as appInsights } from 'applicationinsights';

import createHandler from './api/reference/create';
import fetchHandler from './api/reference/fetch';
import collectHandler from './api/collect';
import webhookHandler from './api/webhook';
import trackHandler from './api/track';
import { biteJS, robots, favicon } from './api/static'
import healthHandler from './api/test/healthCheck'

const appKey = "InstrumentationKey=37d8676b-8328-4a44-b00d-9448ac4fae73;IngestionEndpoint=https://westeurope-5.in.applicationinsights.azure.com/;LiveEndpoint=https://westeurope.livediagnostics.monitor.azure.com/";

let appInsights = require("applicationinsights");
appInsights
.setup(appKey)
.setSendLiveMetrics(true)
.start();

appInsights.setup().start();

export default router(
  get('/health-check', healthHandler),
  get('/favicon.ico', favicon),
  get('/robots.txt', robots),
  // probably serve static files in another way later
  get('/v1/bite.js', biteJS),
  get('/bite.v1.js', biteJS),
  get('/r/collect', collectHandler),
  get('/r/create', createHandler),
  get('/r/fetch', fetchHandler),
  post('/w/collect', webhookHandler),
  get('/*', trackHandler)
);


