import requestIp from 'request-ip';
import anonymize from 'ip-anonymize';
import { dataStoreTrack as datastore } from '../datastore';
import queryParser from '../queryParser';
import { verifyRecaptcha } from '../recaptcha/verify';

const utmParamsToCheck = [
  { key: "utm_source", value: "barnebys" }
];

const checkUrlParams = (url, paramsArray) => {
  const queryString = url.split('?')[1] || '';
  const urlParams = new URLSearchParams(queryString);
  return paramsArray.every(param => urlParams.has(param.key) && urlParams.get(param.key) === param.value);
}

//TODO: add schema for other tables as we change the schema
const schemas = {
  click: ['programId', 'url', 'lead', 'clientIP', 'userAgent', 'dimension1', 'dimension2', 'dimension3', 'dimension4', 'dimension5', 'isSponsored', 'hasUTMTag', 'dealType', 'source', 'recaptchaScore', 'recaptchaSuccess'],
  default: ['programId', 'url', 'lead', 'clientIP', 'userAgent', 'dimension1', 'dimension2', 'dimension3', 'dimension4', 'dimension5', 'isSponsored', 'hasUTMTag', 'dealType', 'recaptchaScore', 'recaptchaSuccess']
};

const buildRow = (schema, data) => {
  return schema.reduce((row, field) => {
    row[field] = data[field] !== undefined ? data[field] : '';
    return row;
  }, {});
}

export default async function track(req, _res) {
  const {
    programId,
    // sessionId,
    // locale,
    kind,
    affiliate,
    url,
    dimension1,
    dimension2,
    dimension3,
    dimension4,
    dimension5,
    isSponsored,
    dealType,
    source,
    recaptchaToken
  } = queryParser(req.url);

  const now = new Date(Date.now()).toISOString();

  let clientIP = requestIp.getClientIp(req);
  try {
    clientIP = anonymize(clientIP);
  } catch (err) {}

  const hasUTMTag = kind === 'click' ? checkUrlParams(url, utmParamsToCheck) : false;

  // Verify reCAPTCHA token
  let recaptchaResult = { success: false, score: 0 };
  if (recaptchaToken) {
    try {
      recaptchaResult = await verifyRecaptcha(recaptchaToken, clientIP);
      if (!recaptchaResult.success) {
        console.warn('reCAPTCHA verification failed:', recaptchaResult.error);
      }
    } catch (error) {
      console.error('reCAPTCHA verification error:', error.message);
    }
  } else {
    console.warn('No reCAPTCHA token provided in request');
  }

  let rows = [
    {
      programId,
      url,
      lead: false,
      clientIP,
      userAgent: req.headers && req.headers['user-agent'],
      dimension1: dimension1 || '',
      dimension2: dimension2 || '',
      dimension3: dimension3 || '',
      dimension4: dimension4 || '',
      dimension5: dimension5 || '',
      isSponsored: isSponsored === '1',
      dealType: dealType || null,
      hasUTMTag: hasUTMTag,
      source: source || null,
      recaptchaScore: recaptchaResult.score,
      recaptchaSuccess: recaptchaResult.success
    },
  ];

  // Handle leads
  if (
    !affiliate &&
    req.session.programId &&
    req.session.kind &&
    req.session.kind === kind
  ) {
    rows.push({
      programId: req.session.programId,
      url,
      lead: true,
      clientIP,
      userAgent: req.headers && req.headers['user-agent'],
      dimension1: dimension1 || '',
      dimension2: dimension2 || '',
      dimension3: dimension3 || '',
      dimension4: dimension4 || '',
      dimension5: dimension5 || '',
      isSponsored: isSponsored === '1',
      dealType: dealType || null,
      hasUTMTag: hasUTMTag,
      source: source || null,
      recaptchaScore: recaptchaResult.score,
      recaptchaSuccess: recaptchaResult.success
    });

    req.session = null;
  }

  const tableName = kind;
  if(kind === 'click') {
    const updatedRows = rows.map(row => buildRow(schemas.click, row));
    rows = [...updatedRows];
  } else {
    const updatedRows = rows.map(row => buildRow(schemas.default, row));
    rows = [...updatedRows];
  }

  return datastore.insert(tableName, rows, now).catch((err) => {
    console.error('ERROR:', err);
    const { insertErrors } = err.response;

    if (insertErrors && insertErrors.length > 0) {
      console.log(`Insert errors [${tableName}]:`);
      insertErrors.forEach((err) => console.error(err));
    }
  });
}
