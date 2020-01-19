const { SESSION_NAME, SESSION_MAX_AGE, SECRET, SITE_URL } = process.env

const session = require('micro-cookie-session')({
    name: SESSION_NAME,
    keys: [SECRET],
    maxAge: SESSION_MAX_AGE * 60 * 1000,
})

const emptygif = require('emptygif')
const encodeUrl = require('encodeurl')

const {collectTrack} = require('../../lib/collect')
const {queryParserTrack} = require('../../lib/queryParser')

const redirect = (response, statusCode, redirectTarget) => {
    response.writeHead(statusCode, {
	    Location: redirectTarget
    })
    return response.end()
}

module.exports = async (req, res) => {
    const { programId, kind, affiliate, url } = queryParserTrack(req.url)

    if (!programId || !kind) {
        console.log('Missing required `programId` and/or `kind` values')
        if (SITE_URL) {
            return redirect(res, 302, SITE_URL)
        }

	return res.status(204).end()
    }

    // Start session
    session(req, res)

    // Run tracker async
    await collectTrack(req, res)

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
}
