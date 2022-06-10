import faunadb, { query as q } from 'faunadb';
import { send } from 'micro';

const { FAUNADB_SECRET: secret } = process.env;

if (secret) {
  console.error('%c FaunaDB Error: Missing Secret.', "color:red");
}

const client = new faunadb.Client({ secret });

export async function queryByFingerprintAndRef(programId, fingerprint, ref) {
  let result = null;
  try {
    
    result = await client.query(
      q.Get(
        q.Intersection(
          q.Intersection(
            ...getIntersectionRef(ref),
            q.Match(q.Index('programId'), programId),
            q.Match(q.Index('fingerprint'), fingerprint)
          )
        )
      )
    );
    delete result.ref;

  } catch (error) {
    // cache miss
  }
  return result;
}

export async function queryByRef(programId, ref) {
  const ret = await client.query(
    q.Get(
      q.Intersection(
        ...getIntersectionRef(ref),
        q.Match(q.Index('programId'), programId)
      )
    )
  );
  delete ret.ref;
  return ret;
}

export async function queryByRefAndTraffic(programId, ref) {
  return await setTrafficSource(await queryByRef(programId, ref));
}

export async function queryByFingerprint(programId, fingerprint) {
  
  try {
    const ret = await client.query(
      q.Get(
        q.Intersection(
          q.Match(q.Index('fingerprint'), fingerprint),
          q.Match(q.Index('programId'), programId)
        )
      )
    );
    delete ret.ref;
    return ret;
  } catch (error) {
    console.log('here is the error');
    console.log(error);
  }
  
}

const setTrafficSource = async (reference) => {
  const {
    data: { fingerprint, programId },
  } = reference;

  try {
    // try fetch session in order to see if the request came from a barnebys click
    await client.query(
      q.Get(
        q.Intersection(
          q.Match(q.Index('fingerprint'), fingerprint),
          q.Match(q.Index('programId'), programId),
          q.Match(q.Index('type'), 'barnebys')
        )
      )
    );
    reference.data['source'] = 'barnebys';
  } catch (err) {
    reference.data['source'] = 'other';
  }

  return reference;
};

const getIntersectionRef = (ref) =>
  ref
    .split(',')
    .reduce((acc, cur) => acc.concat(q.Match(q.Index('refs'), cur)), []);

export default async function fetchHandler(req, res) {
  const { ref, fingerprint, programId } = req.query;

  if (fingerprint && ref) {
    try {
      return send(
        res,
        200,
        await queryByFingerprintAndRef(programId, fingerprint, ref)
      );
    } catch (err) {
      return send(res, 404, { error: 'not found' });
    }
  }

  if (fingerprint) {
    try {
      return send(res, 200, await queryByFingerprint(programId, fingerprint));
    } catch (err) {
      return send(res, 404, { error: 'not found' });
    }
  }

  if (ref) {
    try {
      return send(res, 200, await queryByRefAndTraffic(programId, ref));
    } catch (err) {
      return send(res, 404, { error: 'not found' });
    }
  }

  return send(res, 400, { error: 'missing ref or fingerprint' });
}