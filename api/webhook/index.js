import fetch from "isomorphic-unfetch";
const { send, createError, run, json } = require("micro");

import NotDeployedError from "../../lib/error/NotDeployedError";
import { dataStoreEvent as datastore } from "../../lib/datastore";

export default async (req, res) => {
  if (req.method === "POST") {
    const {
      ref,
      programId,
      eventCategory,
      eventAction,
      eventLabel,
      eventValue,
      eventCurrency
    } = await json(req);

    const now = new Date(Date.now()).toISOString();

    const { "x-now-deployment-url": nowURL } = req.headers;

    if (!nowURL) {
      throw new NotDeployedError();
    }

    const result = await fetch(
      `http://${nowURL}/api/reference/fetch?ref=${ref}`
    );
    const source = result.status === 200 ? "barnebys" : "other";

    const rows = [
      {
        programId,
        url: "",
        clientIP: "",
        userAgent: "",
        action: eventAction,
        category: eventCategory,
        source,
        label: eventLabel || "",
        value: eventValue || "",
        currency: eventCurrency || ""
      }
    ];

    const tableName = "events";

    await datastore.insert(tableName, rows, now).catch(err => {
      console.error("ERROR:", err);
      const { insertErrors } = err.response;

      if (insertErrors && insertErrors.length > 0) {
        console.log("Insert errors:");
        insertErrors.forEach(err => console.error(err));
      }
    });
    await res.json({ status: "ok", source: source });
  } else {
    await res.json({ status: "error", error: "method not allowed" });
  }

  res.end();
};
