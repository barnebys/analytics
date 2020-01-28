const { SESSION_NAME, SESSION_MAX_AGE, SECRET, SITE_URL } = process.env;

import { collectEvent, collectTrack } from "../../lib/collect";
import queryParser from "../../lib/queryParser";

const session = require("micro-cookie-session")({
  name: SESSION_NAME,
  keys: [SECRET],
  maxAge: SESSION_MAX_AGE * 60 * 1000
});

const emptygif = require("emptygif");
const encodeUrl = require("encodeurl");

const redirect = (response, statusCode, redirectTarget) => {
  response.writeHead(statusCode, {
    Location: redirectTarget
  });
  return response.end();
};

const handleTrack = async (req, res) => {
  const { programId, kind, affiliate, url } = queryParser(req.url);

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
  await collectTrack(req, res);

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
      "Cache-Control": "public, max-age=0"
    });
  }
};

const handleEvent = async (req, res) => {
  const { programId, action, category } = queryParser(req.url);

  if (!programId || !action || !category) {
    console.log(
      "Missing required `programId` and/or `action` and/or `category` values"
    );
  } else {
    await collectEvent(req, res);
  }

  return emptygif.sendEmptyGif(req, res, {
    "Content-Type": "image/gif",
    "Content-Length": emptygif.emptyGifBufferLength,
    "Cache-Control": "public, max-age=0"
  });
};

module.exports = async (req, res) => {
  const { hitType } = queryParser(req.url);

  if (hitType === "event") {
    return handleEvent(req, res);
  } else {
    return handleTrack(req, res);
  }
};
