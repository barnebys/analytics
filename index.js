import { router, get, post } from 'microrouter';

import createHandler from './api/reference/create';
import fetchHandler from './api/reference/fetch';
import collectHandler from './api/collect';
import webhookHandler from './api/webhook';
import trackHandler from './api/track';
import { biteJS, robots, favicon } from './api/static'
import healthHandler from './api/test/healthCheck'
import recaptchaTestHandler from './api/test/recaptcha'

export default router(
  get('/health-check', healthHandler),
  get('/test/recaptcha', recaptchaTestHandler),
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
