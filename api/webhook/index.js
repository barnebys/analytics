import _ from "lodash";
import fetch from "isomorphic-unfetch";
const { send, createError, run, json } = require("micro");

import NotDeployedError from "../../lib/error/NotDeployedError";
import { dataStoreEvent as datastore } from "../../lib/datastore";

const getEvents = async (req, nowURL) => {
  const events = await json(req);
  return await Promise.all(
    events.map(async event => {
      return fetch(
        `http://${nowURL}/r/fetch?ref=${event.ref}&programId=${event.programId}`
      ).then(async res => {
        const { data, error } = await res.json();
        return {
          data: {
            programId: event.programId,
            url: "",
            clientIP: _.get(data, "clientIP", ""),
            userAgent: _.get(data, "userAgent", ""),
            sessionId: _.get(data, "fingerprint", ""),
            action: event.eventAction,
            category: event.eventCategory,
            source: _.get(data, "source", "unkown"),
            label: event.eventLabel || "",
            value: event.eventValue || "",
            currency: event.eventCurrency || ""
          },
          ref: event.ref,
          status: res.status,
          error: error || ""
        };
      });
    })
  );
};

export default async (req, res) => {
  if (req.method === "POST") {
    // todo check for mandatory values

    const now = new Date(Date.now()).toISOString();

    const { "x-vercel-deployment-url": nowURL } = req.headers;

    if (!nowURL) {
      throw new NotDeployedError();
    }

    const events = await getEvents(req, nowURL);
    const rows = events.reduce((acc, cur) => acc.concat(cur.data), []);

    const response = events.reduce(
      (acc, cur) =>
        acc.concat({
          status: cur.status === 200 ? "hit" : "miss",
          programId: _.get(cur, "data.programId"),
          ref: _.get(cur, "ref"),
          source: _.get(cur, "data.source", "other"),
          error: cur.error
        }),
      []
    );

    const tableName = "events";

    await datastore.insert(tableName, rows, now).catch(err => {
      console.error("ERROR:", err);
      const { insertErrors } = err.response;

      if (insertErrors && insertErrors.length > 0) {
        console.log("Insert errors:");
        insertErrors.forEach(err => console.error(err));
      }
    });
    await res.json({ status: "ok", data: response });
  } else {
    await res.json({ status: "error", error: "method not allowed" });
  }

  res.end();
};
