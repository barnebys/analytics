import { send } from '../lib/responseHandler';

export default function sendEmptyGif(req, res) {
  const gifBuffer = Buffer.from(
    'R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
    'base64'
  );

  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Cache-Control', 'public, max-age=0');

  return send(req, res, 200, gifBuffer);
}
