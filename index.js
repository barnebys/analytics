import { router, get, post } from 'microrouter';
import { send } from 'micro';
import fsp from 'fs/promises';

import createHandler from './api/reference/create';
import fetchHandler from './api/reference/fetch';
import collectHandler from './api/collect';
import webhookHandler from './api/webhook';
import trackHandler from './api/track';
import healthHandler from './api/test/healthCheck'

export default router(
  get('/health-check', healthHandler),
  get('/favicon.ico', (_req, res) => send(res, 204)),
  // probably serve static files in another way later
  get('/v1/bite.js', async (_req, res) => {
    const jsFile = "./public/bite.v1.js"
    let buffer = {};
    try {
      buffer = await fsp.readFile(jsFile).then(data => data).catch(err => {throw err});
      res.setHeader('Content-Type', 'text/javascript');
      return send(res, 200, buffer);
    } catch(err) {
      return send(res, 500, {'msg': `unable to load ${jsFile} file.`})
    }
  }),
  get('/r/collect', collectHandler),
  get('/r/create', createHandler),
  get('/r/fetch', fetchHandler),
  post('/w/collect', webhookHandler),
  get('/*', trackHandler)
);
