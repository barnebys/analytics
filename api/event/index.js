const emptygif = require('emptygif')


import {collectEvent as collect} from "../../lib/collect"
import {queryParserEvent as queryParser} from "../../lib/queryParser"

module.exports = async (req, res) => {
    const { programId, action, category } = queryParser(req.url)

    if (!programId || !action || !category) {
        console.log('Missing required `programId` and/or `action` and/or `category` values')
    } else {
        await collect(req, res)
    }

    return emptygif.sendEmptyGif(req, res, {
        'Content-Type' : 'image/gif',
        'Content-Length' : emptygif.emptyGifBufferLength,
        'Cache-Control' : 'public, max-age=0' // or specify expiry to make sure it will call everytime
    });

}
