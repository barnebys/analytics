const { parse } = require('url')

export default url => {
    const { query } = parse(url, true)

    if (query._h === "event") {
        return {
            hitType: query._h,
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
    } else {
        return {
            hitType: query._h,
            programId: query.p,
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

}
