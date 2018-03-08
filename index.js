require('dotenv').config()

const { SESSION_NAME, SESSION_MAX_AGE, SECRET, SITE_URL } = process.env
const { parse } = require('url')
const { send } = require('micro')

const md5 = require('md5')
const emptygif = require('emptygif')
const redirect = require('micro-redirect')
const session = require('micro-cookie-session')({
    name: SESSION_NAME,
    keys: [SECRET],
    maxAge: SESSION_MAX_AGE * 60 * 1000,
})

const track = require('./lib/track')

const robots = ['User-agent: *', 'Disallow: /'].join("\n")

module.exports = async (req, res) => {

    const { query: { s, p, k, a, url } } = parse(req.url, true)

    const signedURL = req.url.slice(0, req.url.lastIndexOf('&s='))
    const hash = md5(SECRET + signedURL)

    if (req.url === '/robots.txt') {
        return send(res, 200, robots)
    } else if (req.url === '/favicon.ico') {
        return send(res, 204)
    }

    if (!p || !k) {
        if (SITE_URL) {
            return redirect(res, 302, SITE_URL)
        } else {
            return send(res, 204)
        }
    }

    if (hash !== s) {
        const err = new Error('Invalid `signed` value')
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
        return redirect(res, 302, url)
    } else {
        return emptygif.sendEmptyGif(req, res, {
            'Content-Type' : 'image/gif',
            'Content-Length' : emptygif.emptyGifBufferLength,
            'Cache-Control' : 'public, max-age=0' // or specify expiry to make sure it will call everytime
        });
    }

}