import { router, get, post } from 'microrouter';
import { send } from 'micro';

import createHandler from './api/reference/create';
import fetchHandler from './api/reference/fetch';
import collectHandler from './api/collect';
import webhookHandler from './api/webhook';
import trackHandler from './api/track';
import { biteJS, robots } from './api/static'
import healthHandler from './api/test/healthCheck'


export default router(
  get('/health-check', healthHandler),
  get('/favicon.ico', (_req, res) => send(res, 204)),
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


