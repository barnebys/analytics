const requestIp = require("request-ip");
const anonymize = require("ip-anonymize");
import { dataStoreTrack as datastore } from "../datastore";
import queryParser from "../queryParser";

module.exports = async (req, res) => {
  const {
    programId,
    sessionId,
    locale,
    kind,
    affiliate,
    url,
    dimension1,
    dimension2,
    dimension3,
    dimension4,
    dimension5
  } = queryParser(req.url);

  const now = new Date(Date.now()).toISOString();

  let clientIP = requestIp.getClientIp(req);
  try {
    clientIP = anonymize(clientIP);
  } catch (err) {}

  // Default event click/impression
  let rows = [
    {
      programId,
      url,
      lead: false,
      clientIP,
      userAgent: req.headers && req.headers["user-agent"],
      dimension1: dimension1 || "",
      dimension2: dimension2 || "",
      dimension3: dimension3 || "",
      dimension4: dimension4 || "",
      dimension5: dimension5 || ""
    }
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
      userAgent: req.headers && req.headers["user-agent"],
      dimension1: dimension1 || "",
      dimension2: dimension2 || "",
      dimension3: dimension3 || "",
      dimension4: dimension4 || "",
      dimension5: dimension5 || ""
    });

    req.session = null;
  }

  const tableName = kind;

  return datastore.insert(tableName, rows, now).catch(err => {
    console.error("ERROR:", err);
    const { insertErrors } = err.response;

    if (insertErrors && insertErrors.length > 0) {
      console.log("Insert errors:");
      insertErrors.forEach(err => console.error(err));
    }
  });
};
