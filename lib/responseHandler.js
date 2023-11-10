import { send as httpResponse } from 'micro';
// import { appInsightsTrack } from './appInsights';
//import { pushToAzureEventHub } from './azEventHub';

export async function send(req, res, statusCode, message) {
  // appInsightsTrack(req, statusCode, message);
  //pushToAzureEventHub(req);
  res.setHeader('Access-Control-Allow-Origin', '*');
  return httpResponse(res, statusCode, message);
}

export async function redirect(req, res, statusCode, url, message) {
  // appInsightsTrack(req, statusCode, message);
  //pushToAzureEventHub(req);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Location', url);
  return httpResponse(res, statusCode);
}
