(function () {
    self = this;

    var actions = {
        'init': function (programId) {
            self.programId = programId;
        },
        'send': function (hitType, eventCategory, eventAction, eventLabel, eventValue) {
            if (!self.programId) {
                throw new Error('BarnebysAnalytics is not initialized correctly');
            }

            var query = '/?p=' + self.programId +
                '&k='  + hitType +
                '&d1=' + eventCategory +
                '&d2=' + eventAction +
                '&d3=' + eventLabel +
                '&d4=' + eventValue;

            var request = new XMLHttpRequest();
            request.open('GET', 'http://localhost:3000' + query);
            request.send();
        }
    };

    function performAction(actionName, ...args) {
        var action = actions[actionName] || (function () { console.log(action, 'not implemented') });
        action(...args);
    };

    var actionQueue = window[window['BarnebysAnalyticsObject']].q;
    actionQueue.forEach(function ([action, ...args]) {
        performAction(action, ...args);
    });

    window[window['BarnebysAnalyticsObject']] = performAction;
})();
