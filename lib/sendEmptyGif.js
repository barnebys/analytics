import { send } from 'micro';

export default function sendEmptyGif(res) {
  const gifBuffer = Buffer.from(
    'R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
    'base64'
  );

  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Cache-Control', 'public, max-age=0');

  return send(res, 200, gifBuffer);
}
