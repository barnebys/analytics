const appInsights = require("applicationinsights");

appInsights.setup();
appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = "Analytics"
appInsights.start();
const client = appInsights.defaultClient;

export async function appInsightsTrack (req, statusCode, message) {

    trackRequest (req, statusCode)

    if(statusCode.toString().startsWith('4')) 
        return trackException (req, message)
    
}

function trackException (req, message) {
    client.trackException({name:req.url, url:`${req.headers.host}${req.url}`, exception: new Error(JSON.stringify(message))});
}


function trackRequest (req, statusCode) {
    const requestStatus = statusCode.toString().startsWith('2') || statusCode.toString().startsWith('3');
    client.trackRequest({name:req.url, url:`${req.headers.host}${req.url}`, duration:'xxx', resultCode:statusCode, success: requestStatus});
}