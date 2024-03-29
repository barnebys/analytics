import getBrowserFingerprint from "@barnebys/fingerprint";

(function() {
  const state = {
    debug: false,
    programId: null,
    refs: null,
    fingerprint: null
  };

  function log(type, state, query) {
    if (!state.debug) {
      return false;
    }

    if (type === "init") {
      console.log(
        "%c Barnebys Analytics Initialized for " + state.programId,
        "font-size:1.5em;font-weight:bold;"
      );
      if (query.refs) {
        console.log(
          "%c BTM available, source is Barnebys",
          "color:orange;font-weight:bold;"
        );
      } else {
        console.log(
          "%c No BTM, traffic source will be identified by fingerprint",
          "color:red;font-weight:bold;"
        );
      }
    }

    if (type === "fingerprint") {
      console.log(
        "%c Fingerprint [" +
          state.fingerprint +
          "] with refs [" +
          query.refs +
          "] sent",
        "color:orange;font-weight:bold;"
      );

      console.table(query);
    }

    if (type === "event") {
      console.log(
        "%c sending event for " + state.programId,
        "color:red;font-weight:bold;"
      );
      console.log(
        "%c using fingerprint [" +
          state.fingerprint +
          "] with refs [" +
          state.refs +
          "]",
        "color:orange;font-weight:normal;"
      );

      console.table(query);
    }
  }

  function sendEvent({
    hitType,
    eventCategory,
    eventAction,
    eventLabel,
    eventValue,
    eventCurrency
  }) {
    if (!state.programId) {
      throw new Error("BarnebysAnalytics is not initialized correctly");
    }

    log("event", state, {
      hitType,
      eventCategory,
      eventAction,
      eventLabel,
      eventValue,
      eventCurrency
    });

    const query = {
      _f: state.fingerprint,
      _r: state.refs,
      _h: hitType,
      p: state.programId,
      c: eventCategory,
      a: eventAction,
      l: eventLabel,
      v: eventValue,
      cur: eventCurrency,
      url: window.location
    };

    const queryString = Object.keys(query)
      .map(key => key + "=" + query[key])
      .join("&");

    const request = new XMLHttpRequest();
    request.open("GET", `https://analytics.barnebys.net/r/collect?${queryString}`);
    request.send();
  }

  function sendFingerprint(refs, type) {
    const request = new XMLHttpRequest();
    request.open(
      "GET",
      `https://analytics.barnebys.net/r/create?fingerprint=${
        state.fingerprint
      }&refs=${refs}&programId=${state.programId}&type=${
        !type ? "other" : type
      }`
    );
    request.send();

    log("fingerprint", state, refs);
  }

  const actions = {
    debug: () => {
      state.debug = true;
    },
    refs: refs => {
      state.refs = refs;
      sendFingerprint({ refs });
    },
    init: (programId, refs) => {
      (state.programId = programId),
        (state.refs = refs),
        (state.fingerprint = getBrowserFingerprint());

      if (refs) {
        sendFingerprint(refs);
      }
    },
    send: (
      hitType,
      eventCategory,
      eventAction,
      eventLabel,
      eventValue,
      eventCurrency
    ) => {
      if (typeof hitType === "object") {
        const eventObject = hitType;
        sendEvent(eventObject);
        return;
      }

      sendEvent({
        hitType,
        eventCategory,
        eventAction,
        eventLabel,
        eventValue,
        eventCurrency
      });
    }
  };

  function performAction(actionName, ...args) {
    const action =
      actions[actionName] || (() => console.log(action, "not implemented"));
    action(...args);
  }

  const actionQueue = window[window["BarnebysAnalyticsObject"]].q;
  actionQueue.forEach(function([action, ...args]) {
    performAction(action, ...args);
  });

  window[window["BarnebysAnalyticsObject"]] = performAction;
})();
