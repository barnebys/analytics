const { parse } = require('url')

export default url => {
    const { query } = parse(url, true)

    return {
        programId: query.p,
        sessionId: query.sid,
        url: query.url,
        locale: query.locale,
        category: query.c,
        action: query.a,
        label: query.l,
        value: query.v,
        currency: query.cur,

    }
}
