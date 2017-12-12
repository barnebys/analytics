require('dotenv').config()

const { parse } = require('url')
const emptygif = require('emptygif')
const redirect = require('micro-redirect')
const md5 = require('md5');

const track = require('./lib/track')

const session = require('micro-cookie-session')({
    name: process.env.SESSION_NAME,
    keys: [process.env.SECRET],
    maxAge: process.env.SESSION_MAX_AGE * 60 * 1000,
})

/**
 * Barnebys Analytics Tracker
 *
 * Available parameters
 * s, signed
 * p, programId
 * k, kind
 * a, affiliate
 * url, url
 * d1-d3, dimension1-3
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports = async (req, res) => {

    const { query: { s, p, k, a, url } } = parse(req.url, true)

    const signedURL = req.url.slice(0, req.url.lastIndexOf('&s='))
    const hash = md5(process.env.SECRET + signedURL)

    if (hash !== s) {
        const err = new Error('Invalid `signed` value')
        err.statusCode = 400
        throw err
    }

    if (!p) {
        const err = new Error('Missing `p` parameter with program id')
        err.statusCode = 400
        throw err
    }

    if (!k) {
        const err = new Error('Missing `k` parameter with kind type')
        err.statusCode = 400
        throw err
    }

    // Start session
    session(req, res)

    // Run tracker async
    track(req, res)

    // handle leads from affiliates
    if (a) {
        req.session.kind = k
        req.session.programId = p
    } else {
        req.session = null
    }

    if (url) {
        // Do redirect
        redirect(res, 302, url)
    } else {
        return emptygif.sendEmptyGif(req, res, {
            'Content-Type' : 'image/gif',
            'Content-Length' : emptygif.emptyGifBufferLength,
            'Cache-Control' : 'public, max-age=0' // or specify expiry to make sure it will call everytime
        });
    }

}