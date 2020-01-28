import _ from "lodash";
const requestIp = require("request-ip");
const anonymize = require("ip-anonymize");
import faunadb, { query as q } from "faunadb";

const { FAUNADB_SECRET: secret } = process.env;

let client;

if (secret) {
  client = new faunadb.Client({ secret });
}

module.exports = async (req, res) => {
  const { fingerprint, refs } = req.query;

  if (!fingerprint || !refs) {
    res.status(400);
    return res.send("missing fingerprint and/or refs");
  }

  let clientIP = requestIp.getClientIp(req);
  try {
    clientIP = anonymize(clientIP);
  } catch (err) {}

  const ret = await client.query(
    q.Create(q.Collection("references"), {
      data: {
        fingerprint,
        refs: refs.split(","),
        type: _.get(res.query, "type", "default"),
        clientIP,
        userAgent: req.headers && req.headers["user-agent"]
      }
    })
  );

  console.log(ret);
  res.send("done");
};
