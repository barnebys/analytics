import _ from 'lodash';
import { getClientIp } from 'request-ip';
import anonymize from 'ip-anonymize';
import { connectToDatabase } from '../../../lib/mongodb';
import { send } from '../../../lib/responseHandler';

import {
  queryByFingerprintAndRef,
  queryByFingerprint,
  queryByRef,
} from '../fetch';

export default async function createHandler(req, res) {
  const { fingerprint, refs, programId } = req.query;

  if (!fingerprint || !refs || !programId) {
    return send(req, res, 403, 'Missing required `fingerprint`, `refs`  and/or `programId` values');
  }

  try {
    const exists = await checkIfSessionExists(programId, fingerprint, refs);

    if (exists) {
      return send(req, res, 400, 'already created');
    }

    const clientIP = getAnonomizedIp(req);

    const { db } = await connectToDatabase();
    const references = db.collection('references');
    
    await references.insertOne({
      fingerprint,
      refs: refs.split(','),
      type: _.get(req.query, 'type', 'other'),
      programId,
      clientIP,
      userAgent: req.headers && req.headers['user-agent'],
      createdAt: new Date()
    });

    return send(req, res, 200, 'done');
  } catch (err) {
    console.error('Create reference error:', err);
    return send(req, res, 500, 'something went wrong');
  }
}

function getAnonomizedIp(req) {
  const clientIP = getClientIp(req);

  try {
    return anonymize(clientIP);
  } catch (err) {
    return clientIP;
  }
}

async function checkIfSessionExists(programId, fingerprint, refs) {
  if (fingerprint && refs) {
    return await queryByFingerprintAndRef(programId, fingerprint, refs)
      .then(() => true)
      .catch(() => false);
  }

  if (fingerprint) {
    return await queryByFingerprint(programId, fingerprint)
      .then(() => true)
      .catch(() => false);
  }

  if (refs) {
    return await queryByRef(programId, refs)
      .then(() => true)
      .catch(() => false);
  }

  return false;
}
