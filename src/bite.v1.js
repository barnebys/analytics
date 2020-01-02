(function () {
    const state = {
        programId: null,
        sessionId: null,
    }

    function sendEvent({ hitType, eventCategory, eventAction, eventLabel, eventValue }) {
        if (!state.programId) {
            throw new Error('BarnebysAnalytics is not initialized correctly')
        }

        let query = '/?p=' + state.programId +
            '&k=conversion' +
            '&d1=' + hitType +
            '&d2=' + eventCategory +
            '&d3=' + eventAction +
            '&d4=' + eventLabel +
            '&d5=' + eventValue

        if (state.sessionId) {
            query += '&sid=' + state.sessionId
        }

        const request = new XMLHttpRequest()
        request.open('GET', process.env.BA_HOST + '/api' + query)
        request.send()
    }

    function extractBTMParameters() {
        const currentLocation = new URL(window.location)
        const searchParams = new URLSearchParams(currentLocation.search)
        const params = Array.from(searchParams.entries())

        return params
            .filter(([key]) => key.startsWith('btm_'))
            .reduce((mapping, [key, value]) => ({
                ...mapping,
                [key.replace('btm_', '')]: value,
            }), {})
    }

    function determineSession() {
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

        const btmTags = extractBTMParameters()

        if (btmTags['session_id']) {
            document.cookie = `barnebys_session=${btmTags['session_id']}`
            return btmTags['session_id']
        }

        return null
    }

    const actions = {
        'init': (programId) => {
            state.programId = programId
            state.sessionId = determineSession()
        },
        'send': (hitType, eventCategory, eventAction, eventLabel, eventValue) => {
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
