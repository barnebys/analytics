import { router, get, post } from 'microrouter';
import { send } from 'micro';
// import fs from require("fs").promises;

import createHandler from './api/reference/create';
import fetchHandler from './api/reference/fetch';
import collectHandler from './api/collect';
import webhookHandler from './api/webhook';
import trackHandler from './api/track';
import BQHandler from './api/test/bigquery'

export default router(
  get('/favicon.ico', (_req, res) => send(res, 204)),
  // probably serve static files in another way later
  // get('/bite.v1.js', async (_req, res) => {
  //   try {
  //     const buffer = await fs.readFile('./public/bite.v1.js');
  //     res.setHeader('Content-Type', 'text/javascript');
  //     send(res, 200, buffer);
  //   } catch {
  //     return send(res, 500);
  //   }
  // }),
  get('/r/collect', collectHandler),
  get('/r/create', createHandler),
  get('/r/fetch', fetchHandler),
  post('/w/collect', webhookHandler),
  post('/bq/test', BQHandler),
  get('/*', trackHandler)
);
