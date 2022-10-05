const appInsights = require("applicationinsights");

appInsights.setup();
appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = "Analytics"
appInsights.start();
const client = appInsights.defaultClient;

export async function appInsightsTrack (req, statusCode, message) {

    trackRequest (req, statusCode, message)

    if(!statusCode.toString().startsWith('2')) 
        return trackException (req, message)
    
    // client.trackEvent({name: "Analytics custom event", properties: {customProperty: "custom property value"}});
    // client.trackException({exception: new Error("handled exceptions can be logged with this method")});
    // client.trackMetric({name: "Analytics custom metric", value: 3});
    // client.trackTrace({message: "Analytics trace message"});
    // client.trackDependency({target:"http://dbname", name:"select customers proc", data:"SELECT * FROM Customers", duration:231, resultCode:0, success: true, dependencyTypeName: "ZSQL"});
    // client.trackRequest({name:"GET /Analytics/customers", url:"http://myserver/customers", duration:309, resultCode:200, success:true});
}

function trackException (req, message) {
    client.trackException({name:req.url, url:`${req.headers.host}${req.url}`, exception: new Error(JSON.stringify(message))});
}


function trackRequest (req, statusCode, message) {
    client.trackRequest({name:req.url, url:`${req.headers.host}${req.url}`, duration:'xxx', resultCode:statusCode});
}