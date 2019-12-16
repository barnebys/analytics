(function () {
    const state = {
        programId: null
    }

    function sendEvent({ hitType, eventCategory, eventAction, eventLabel, eventValue }) {
        if (!state.programId) {
            throw new Error('BarnebysAnalytics is not initialized correctly')
        }

        const query = '/?p=' + state.programId +
            '&k='  + hitType +
            '&d1=' + eventCategory +
            '&d2=' + eventAction +
            '&d3=' + eventLabel +
            '&d4=' + eventValue

        const request = new XMLHttpRequest()
        request.open('GET', process.env.BA_HOST + query)
        request.send()
    }

    const actions = {
        'init': (programId) => {
            state.programId = programId
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
