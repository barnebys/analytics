(function () {
    const state = {
        programId: null
    }

    const actions = {
        'init': (programId) => {
            state.programId = programId
        },
        'send': (hitType, eventCategory, eventAction, eventLabel, eventValue) => {
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
            request.open('GET', 'http://localhost:3000' + query)
            request.send()
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
