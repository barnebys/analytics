import encodeUrl from 'encodeurl';
import microSession from 'micro-cookie-session';
import { send } from 'micro';
import md5 from 'md5';

import { collectTrack } from '../lib/collect';

import sendEmptyGif from '../lib/sendEmptyGif';
import queryParser from '../lib/queryParser';

const { SESSION_NAME, SESSION_MAX_AGE, SECRET, SITE_URL } = process.env;

const session = microSession({
  name: SESSION_NAME,
  keys: [SECRET],
  maxAge: SESSION_MAX_AGE * 60 * 1000,
});

const redirect = (res, statusCode, redirectTarget) => {
  res.setHeader('Location', redirectTarget);
  return send(res, statusCode);
};

export default async function trackHandler(req, res) {
  const { programId, kind, affiliate, url, secret } = queryParser(req.url);

  const signedURL = req.url
    .slice(0, req.url.lastIndexOf('&s='))
    .replace(/%20/g, '+');
  const hash = md5(process.env.SECRET + signedURL);

  if (!programId || !kind) {
    if (SITE_URL) {
      return redirect(res, 307, SITE_URL);
    } else {
      return send(res, 200, 'sending something?');
    }
  }

  if (hash !== secret && kind !== 'impression') {
    return send(res, 400, 'Invalid signed value');
  }

  if (!programId || !kind) {
    console.log('Missing required `programId` and/or `kind` values');
    if (SITE_URL) {
      return redirect(res, 307, SITE_URL);
    }

    return send(res, 200, 'here then?');
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
    return redirect(res, 307, encodeUrl(url));
  } else {
    return sendEmptyGif(res);
  }
}
