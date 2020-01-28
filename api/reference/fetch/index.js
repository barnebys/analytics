import faunadb, { query as q } from 'faunadb';

const { FAUNADB_SECRET: secret } = process.env;

let client;

if (secret) {
    client = new faunadb.Client({ secret });
}

module.exports = async (req, res) => {
    const {ref, fingerprint} = req.query

    if (fingerprint) {
        try {
            const ret = await client.query(q.Get(q.Match(q.Index("fingerprint"), fingerprint)))
            delete ret.ref
            await res.json(ret)

        } catch (err) {
            res.status(404)
            res.send("not found")
        }
    } else if (ref) {
        try {
            const ret = await client.query(q.Get(q.Match(q.Index("refs"), ref)))
            delete ret.ref
            await res.json(ret)

        } catch (err) {
            res.status(404)
            res.send("not found")
        }
    } else {
        res.status(400)
        res.send("Missing ref or fingerprint")
    }


    res.end()

}

