const { SESSION_NAME, SESSION_MAX_AGE, SECRET, SITE_URL } = process.env;

import { collectTrack } from "../lib/collect";
import queryParser from "../lib/queryParser";

const session = require("micro-cookie-session")({
  name: SESSION_NAME,
  keys: [SECRET],
  maxAge: SESSION_MAX_AGE * 60 * 1000,
});

const md5 = require("md5");
const emptygif = require("emptygif");
const encodeUrl = require("encodeurl");

const redirect = (response, statusCode, redirectTarget) => {
  response.writeHead(statusCode, {
    Location: redirectTarget,
  });
  return response.end();
};

module.exports = async (req, res) => {
  const { programId, kind, affiliate, url, secret } = queryParser(req.url);

  const signedURL = req.url
    .slice(0, req.url.lastIndexOf("&s="))
    .replace(/%20/g, "+");
  const hash = md5(process.env.SECRET + signedURL);

  if (!programId || !kind) {
    if (SITE_URL) {
      return redirect(res, 307, SITE_URL);
    } else {
      return res.status(204).end();
    }
  }

  if (
    hash !== secret &&
    kind !== "impression" &&
    kind !== "sponsored_lots_impression"
  ) {
    return res.status(400).send("Invalid signed value");
  }

  if (!programId || !kind) {
    console.log("Missing required `programId` and/or `kind` values");
    if (SITE_URL) {
      return redirect(res, 307, SITE_URL);
    }

    return res.status(204).end();
  }

  // Start session
  session(req, res);

  // Run tracker async
  try {
    await collectTrack(req, res);
  } catch (err) {
    console.log(err);
  }

  // Handle leads from affiliates
  if (affiliate) {
    req.session.kind = kind;
    req.session.programId = programId;
  }

  if (url) {
    redirect(res, 307, encodeUrl(url));
  } else {
    return emptygif.sendEmptyGif(req, res, {
      "Content-Type": "image/gif",
      "Content-Length": emptygif.emptyGifBufferLength,
      "Cache-Control": "public, max-age=0",
    });
  }
};
