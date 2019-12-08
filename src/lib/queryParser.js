const { parse } = require('url')

module.exports = url => {
    const { query } = parse(url, true)

    return {
        signature: query.s,
        programId: query.p,
        kind: query.k,
        affiliate: query.a,
        url: query.url,
        d1: query.d1,
        d2: query.d2,
        d3: query.d3,
        d4: query.d4,
        d5: query.d5,
    }
}
