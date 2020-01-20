(function () {
    const state = {
        programId: null,
        sessionId: null,
        locale: null,
    }

    function sendEvent({ hitType, eventCategory, eventAction, eventLabel, eventValue, eventCurrency }) {
        if (!state.programId) {
            throw new Error('BarnebysAnalytics is not initialized correctly')
        }

        const query = {
            _h: hitType,
            p: state.programId,
            c: eventCategory,
            a: eventAction,
            l: eventLabel,
            v: eventValue,
            cur: eventCurrency,
            url: window.location
        }

        if (state.sessionId) {
            query["sid"] = state.sessionId;
        }

        if (state.locale) {
            query["locale"] = state.locale;
        }

        const queryString = Object.keys(query).map(key => key + '=' + query[key]).join('&');

        const request = new XMLHttpRequest()
        request.open('GET', `${process.env.BA_HOST}/r/collect?${queryString}`)
        request.send()
    }

    function extractBTMParameters() {
        function getParameterByName(name) {
            const url = window.location.href
            const cleanName = name.replace(/[\[\]]/g, '\\$&')
            const regex = new RegExp('[?&]' + cleanName + '(=([^&#]*)|&|#|$)')
            const results = regex.exec(url)
            if (!results) return null
            if (!results[2]) return ''
            return decodeURIComponent(results[2].replace(/\+/g, ' '))
        }

        return {
            'session_id': getParameterByName('btm_session_id'),
            'locale': getParameterByName('btm_locale'),
        }
    }

    function determineSession(btmTags) {
        const cookies = document.cookie
            .split('; ')
            .map(cookie => cookie.split('='))
            .reduce((mapping, [key, value]) => ({
                ...mapping,
                [key]: value,
            }), {})

        if (cookies['barnebys_session']) {
            return cookies['barnebys_session']
        }

        if (btmTags['session_id']) {
            const now = Math.round((new Date()).getTime() / 1000)
            const ttl = parseInt(process.env.BTM_SESSION_TTL, 10)
            const expiresAt = (new Date((now + ttl) * 1000))
                .toUTCString()

            document.cookie = `barnebys_session=${btmTags['session_id']};` +
                `expires=${expiresAt}`
            return btmTags['session_id']
        }

        return null
    }

    const actions = {
        'init': (programId) => {
            state.programId = programId

            const btmTags = extractBTMParameters()

            state.sessionId = determineSession(btmTags)
            state.locale = btmTags['locale']
        },
        'send': (hitType, eventCategory, eventAction, eventLabel, eventValue, eventCurrency) => {
            if (typeof hitType === 'object') {
                const eventObject = hitType
                sendEvent(eventObject)
                return
            }

            sendEvent({
                hitType,
                eventCategory,
                eventAction,
                eventLabel,
                eventValue,
                eventCurrency,
            })
        }
    }

    function performAction(actionName, ...args) {
        const action = actions[actionName] || (() => console.log(action, 'not implemented'))
        action(...args)
    };

    const actionQueue = window[window['BarnebysAnalyticsObject']].q
    actionQueue.forEach(function ([action, ...args]) {
        performAction(action, ...args)
    })

    window[window['BarnebysAnalyticsObject']] = performAction
})()
