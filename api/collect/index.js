import encodeUrl from 'encodeurl';
import { send } from 'micro';
import md5 from 'md5';
import microSessionCookie from 'micro-cookie-session';

import { collectEvent, collectTrack } from '../../lib/collect';
import sendEmptyGif from '../../lib/sendEmptyGif';
import queryParser from '../../lib/queryParser';

const { SESSION_NAME, SESSION_MAX_AGE, SECRET, SITE_URL } = process.env;

const session = microSessionCookie({
  name: SESSION_NAME,
  keys: [SECRET],
  maxAge: SESSION_MAX_AGE * 60 * 1000,
});

function redirect(res, statusCode, redirectTarget) {
  res.setHeader('Location', redirectTarget);
  return send(res, statusCode);
}

async function handleTrack(req, res) {
  const { programId, kind, affiliate, url, secret } = queryParser(req.url);

  const signedURL = req.url.slice(0, req.url.lastIndexOf('&s='));
  const hash = md5(process.env.SECRET + signedURL);

  if (hash !== secret) {
    return send(res, 400, 'Invalid `signed` value');
  }

  if (!programId || !kind) {
    console.log('Missing required `programId` and/or `kind` values');

    if (SITE_URL) {
      return redirect(res, 307, SITE_URL);
    }

    return send(res, 204);
  }

  // Start session
  session(req, res);

  // Run tracker async
  await collectTrack(req, res);

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

async function handleEvent(req, res) {
  const { programId, action, category } = queryParser(req.url);

  if (!programId || !action || !category) {
    console.log(
      'Missing required `programId` and/or `action` and/or `category` values'
    );
  } else {
    await collectEvent(req, res);
  }
  return sendEmptyGif(res);
}

export default async function collectHandler(req, res) {
  const { hitType } = queryParser(req.url);

  if (hitType === 'event') {
    return handleEvent(req, res);
  } else {
    return handleTrack(req, res);
  }
}
