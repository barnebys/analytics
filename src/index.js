require('dotenv').config()
const { SESSION_NAME, SESSION_MAX_AGE, SECRET, SITE_URL } = process.env

const { parse } = require('url')
const { send } = require('micro')
const morgan = require('micro-morgan')
const redirect = require('micro-redirect')
const session = require('micro-cookie-session')({
    name: SESSION_NAME,
    keys: [SECRET],
    maxAge: SESSION_MAX_AGE * 60 * 1000,
})

const md5 = require('md5')
const emptygif = require('emptygif')
const encodeUrl = require('encodeurl')

const track = require('./lib/track')

module.exports = morgan('tiny')(async (req, res) => {
    if (req.url === '/robots.txt') {
        console.log('Sending robots response')
        return send(res, 200, ['User-agent: *', 'Disallow: /'].join("\n"))
    }
    if (req.url === '/favicon.ico') {
        console.log('Sending favicon response')
        return send(res, 204)
    }

    const { query } = parse(req.url, true)
    const {
        s: signature,
        p: programId,
        k: kind,
        a: affiliate,
        url,
    } = query

    if (!programId || !kind) {
        console.log('Missing required `programId` and/or `kind` values')
        if (SITE_URL) {
            return redirect(res, 302, SITE_URL)
        } else {
            return send(res, 204)
        }
    }

    const unsignedQuery = req.url.slice(0, req.url.lastIndexOf('&s='))
    const hash = md5(SECRET + unsignedQuery)
    if (hash !== signature) {
        const err = new Error('Invalid signature')
        err.statusCode = 400
        throw err
    }

    // Start session
    session(req, res)

    // Run tracker async
    track(req, res)

    // Handle leads from affiliates
    if (affiliate) {
        req.session.kind = kind
        req.session.programId = programId
    }

    if (url) {
        redirect(res, 302, encodeUrl(url))
    } else {
        return emptygif.sendEmptyGif(req, res, {
            'Content-Type' : 'image/gif',
            'Content-Length' : emptygif.emptyGifBufferLength,
            'Cache-Control' : 'public, max-age=0' // or specify expiry to make sure it will call everytime
        });
    }
})
