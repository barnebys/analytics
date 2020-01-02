const { parse } = require('url')

module.exports = url => {
    const { query } = parse(url, true)

    return {
        programId: query.p,
        sessionId: query.sid,
        kind: query.k,
        affiliate: query.a,
        url: query.url,
        dimension1: query.d1,
        dimension2: query.d2,
        dimension3: query.d3,
        dimension4: query.d4,
        dimension5: query.d5,
    }
}
