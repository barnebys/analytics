import faunadb, { query as q } from "faunadb";

const { FAUNADB_SECRET: secret } = process.env;

let client;

if (secret) {
  client = new faunadb.Client({ secret });
}

const setTrafficSource = async reference => {
  const {
    data: { fingerprint, programId }
  } = reference;

  try {
    const res = await client.query(
      q.Get(
        q.Intersection(
          q.Match(q.Index("fingerprint"), fingerprint),
          q.Match(q.Index("programId"), programId),
          q.Match(q.Index("type"), "barnebys")
        )
      )
    );
  } catch (err) {
    reference.data["source"] = "other";
    return reference;
  }

  reference.data["source"] = "barnebys";
  return reference;
};

const getIntersectionRef = ref =>
  ref
    .split(",")
    .reduce((acc, cur) => acc.concat(q.Match(q.Index("refs"), cur)), []);

module.exports = async (req, res) => {
  const { ref, fingerprint, programId } = req.query;

  if (fingerprint && ref) {
    try {
      const ret = await client.query(
        q.Get(
          q.Intersection(
            q.Intersection(
              ...getIntersectionRef(ref),
              q.Match(q.Index("programId"), programId),
              q.Match(q.Index("fingerprint"), fingerprint)
            )
          )
        )
      );
      delete ret.ref;
      await res.json(ret);
    } catch (err) {
      res.status(404);
      await res.json({ error: "not found" });
    }
  } else if (fingerprint) {
    try {
      const ret = await client.query(
        q.Get(
          q.Intersection(
            q.Match(q.Index("fingerprint"), fingerprint),
            q.Match(q.Index("programId"), programId)
          )
        )
      );
      delete ret.ref;
      await res.json(ret);
    } catch (err) {
      res.status(404);
      await res.json({ error: "not found" });
    }
  } else if (ref) {
    try {
      const ret = await client.query(
        q.Get(
          q.Intersection(
            ...getIntersectionRef(ref),
            q.Match(q.Index("programId"), programId)
          )
        )
      );
      delete ret.ref;

      await res.json(await setTrafficSource(ret));
    } catch (err) {
      res.status(404);
      console.log(err);
      await res.json({ error: "not found" });
    }
  } else {
    res.status(400);
    await res.json({ error: "missing ref or fingerprint" });
  }

  res.end();
};
