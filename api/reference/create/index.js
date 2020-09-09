import _ from "lodash";
const requestIp = require("request-ip");
const anonymize = require("ip-anonymize");
import faunadb, { query as q } from "faunadb";
import NotDeployedError from "../../../lib/error/NotDeployedError";
import fetch from "isomorphic-unfetch";

const { FAUNADB_SECRET: secret } = process.env;

let client;

if (secret) {
  client = new faunadb.Client({ secret });
}

module.exports = async (req, res) => {
  const { fingerprint, refs, programId } = req.query;

  if (!fingerprint || !refs || !programId) {
    res.status(400);
    return res.send("missing parameters");
  }

  const { "x-vercel-deployment-url": nowURL } = req.headers;

  if (!nowURL) {
    throw new NotDeployedError();
  }

  let match;

  if (fingerprint && !refs) {
    match = await fetch(
      `http://${nowURL}/r/fetch?fingerprint=${fingerprint}&programId=${programId}`
    );
  } else if (refs && !fingerprint) {
    match = await fetch(
      `http://${nowURL}/r/fetch?ref=${refs}&programId=${programId}`
    );
  } else {
    match = await fetch(
      `http://${nowURL}/r/fetch?fingerprint=${fingerprint}&ref=${refs}&programId=${programId}`
    );
  }

  if (match.status === 200) {
    res.send("already created");
  } else {
    let clientIP = requestIp.getClientIp(req);
    try {
      clientIP = anonymize(clientIP);
    } catch (err) {}

    const ret = await client.query(
      q.Create(q.Collection("references"), {
        data: {
          fingerprint,
          refs: refs.split(","),
          type: _.get(req.query, "type", "other"),
          programId,
          clientIP,
          userAgent: req.headers && req.headers["user-agent"]
        }
      })
    );

    console.log(ret);
    res.send("done");
  }
};
