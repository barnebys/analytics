import fsp from 'fs/promises';
import { send } from 'micro';

export async function biteJS(req, res) {
  const fileName = "./public/bite.v1.js";
  return responseHandler(req, res, fileName, 'text/javascript')
}

export async function robots(req, res) {
  const fileName = "./public/robots.txt"
  return responseHandler(req, res, fileName, 'text/plain')
}

async function responseHandler(req, res, fileName, contentType) {
  try {
    const buffer = await fsp.readFile(fileName).then(data => data).catch(err => {throw err});
    res.setHeader('Content-Type', contentType);
    return send(res, 200, buffer);
  } catch (error) {
    return send(res, 500, {'msg': `unable to load ${fileName} file.`})
  }
}
