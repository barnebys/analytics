import encodeUrl from 'encodeurl';
import microSession from 'micro-cookie-session';
import { send, redirect } from '../lib/responseHandler';
import md5 from 'md5';

const querystring = require('querystring');
import { parse } from 'node:url';

import { collectTrack } from '../lib/collect';

import sendEmptyGif from '../lib/sendEmptyGif';
import queryParser from '../lib/queryParser';

const { SESSION_NAME, SESSION_MAX_AGE, SECRET, SITE_URL } = process.env;

const session = microSession({
  name: SESSION_NAME,
  keys: [SECRET],
  maxAge: SESSION_MAX_AGE * 60 * 1000,
});

export default async function trackHandler(req, res) {
  const { query: queryParams } = parse(req.url, true);
  if (queryParams.s) {
    delete queryParams.s;
  }
  const { programId, kind, affiliate, url, secret } = queryParser(req.url);

  const query = '/?' + querystring.stringify(queryParams);
  const hash = md5(process.env.SECRET + query);

  if (!programId || !kind) {
    if (SITE_URL) {
      return redirect(
        req,
        res,
        307,
        SITE_URL,
        'Missing required `programId` and/or `kind` values'
      );
    } else {
      return send(req, res, 500, 'Redirect URL not configured.');
    }
  }

  if (hash !== secret && kind !== 'impression') {
    return send(req, res, 400, 'Invalid signed value');
  }

  // Start session
  session(req, res);

  // Run tracker async
  try {
    await collectTrack(req, res);
  } catch (err) {
    console.log(err);
  }

  // Handle leads from affiliates
  if (affiliate) {
    req.session.kind = kind;
    req.session.programId = programId;
  }

  if (url) {
    return redirect(req, res, 307, encodeUrl(url), `Redirecting to url`);
  } else {
    return sendEmptyGif(req, res);
  }
}
