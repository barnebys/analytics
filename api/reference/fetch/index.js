import { connectToDatabase } from '../../../lib/mongodb';
import { send } from '../../../lib/responseHandler';

export async function queryByFingerprintAndRef(programId, fingerprint, ref) {
  try {
    const { db } = await connectToDatabase();
    const references = db.collection('references');
    
    const refArray = ref.split(',');
    
    const result = await references.findOne({
      programId,
      fingerprint,
      refs: { $in: refArray }
    });
    
    if (!result) {
      throw new Error('Not found');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
}

export async function queryByRef(programId, ref) {
  try {
    const { db } = await connectToDatabase();
    const references = db.collection('references');
    
    const refArray = ref.split(',');
    
    const result = await references.findOne({
      programId,
      refs: { $in: refArray }
    });
    
    if (!result) {
      throw new Error('Not found');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
}

export async function queryByRefAndTraffic(programId, ref) {
  return await setTrafficSource(await queryByRef(programId, ref));
}

export async function queryByFingerprint(programId, fingerprint) {
  try {
    const { db } = await connectToDatabase();
    const references = db.collection('references');
    
    const result = await references.findOne({
      programId,
      fingerprint
    });
    
    if (!result) {
      throw new Error('Not found');
    }
    
    return result;
  } catch (error) {
    return null;
  }
}

const setTrafficSource = async (reference) => {
  if (!reference) return reference;
  
  const { fingerprint, programId } = reference;
  
  try {
    const { db } = await connectToDatabase();
    const references = db.collection('references');
    
    const barnebysSource = await references.findOne({
      fingerprint,
      programId,
      type: 'barnebys'
    });
    
    reference.source = barnebysSource ? 'barnebys' : 'other';
  } catch (err) {
    reference.source = 'other';
  }
  
  return reference;
};

export default async function fetchHandler(req, res) {
  const { ref, fingerprint, programId } = req.query;

  if (fingerprint && ref) {
    try {
      return send(req, res, 200, await queryByFingerprintAndRef(programId, fingerprint, ref));
    } catch (err) {
      return send(req, res, 404, { error: 'not found' });
    }
  }

  if (fingerprint) {
    try {
      return send(req, res, 200, await queryByFingerprint(programId, fingerprint));
    } catch (err) {
      return send(req, res, 404, { error: 'not found' });
    }
  }

  if (ref) {
    try {
      return send(req, res, 200, await queryByRefAndTraffic(programId, ref));
    } catch (err) {
      return send(req, res, 404, { error: 'not found' });
    }
  }

  return send(req, res, 400, { error: 'Missing required `ref` or `fingerprint` value' });
}