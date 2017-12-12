# Barnebys Analytics

A micro tracker for clicks, leads and impressions. 
Microservice design and built on Micro from Zeit. Google BigQuery
is used for storage and currently the only option. Also referred to as BA.

## Parameters
  
    s = signed *
    p = programId *
    k = kind *
    a = affiliate
    url = url
    d1-d3 = dimension1-3
    
    * is mandatory
    
## How to track

BA is a flexible tracker where you as a user define your own rules to track an event. To some extent.

To track clicks (or any other event that you might wanna track) you just need to use the
mandatory parameters. If no URL was specified the tracker will respond with an empty pixel. When you 
need to keep track on leads use the affiliate `a` parameter to drop a cookie. The next time an event occurs 
from the same visitor a lead event will be tracked. Default session length is 1h but it's customizable trough
an environment variable. Kind parameter is then used for separating you'r different events.   

When needed to segment your events specify a value for the predefined dimensions (d1, d2 and d3). Which can be used
to filter, segment your tracked events. 

*Click tracking example*

`analytics.mydomain.com/?programId=<programId>&k=click&url=https://github.com&s=<hash>&s=da8d9...`

*Lead tracking example*

`analytics.mydomain.com/?programId=<programId>&k=click&url=https://yoursite.com&a=1&s=<hash>&s=da8d9...`

*Pixel tracking example* 

`analytics.mydomain.com/?programId=<programId>&k=impressionk&s=<hash>&s=da8d9...`


## Hash for security 

BA enforces you to sign each url. This prevents anyone to spoof or manipulate your tracking events. 
By getting the md5 of <secret> + <uri> and add it to the uri with the `s` parameter BA keeps your tracking links secured.

## Installation & run

Create your project on Google Cloud and drop key.json in your root folder. 
Adjust settings if needed for dotenv then run:

`npm install`      
`npm run start`

## Deployment with Now

You can deploy to any node compatible machine but for ease and scalabilty we suggest using Now.

`now`

`now alias ${deploymentUrl} ${productionFQDN}`

## Clients / Libraries

[Barnebys Analytics PHP](https://github.com/barnebys/barnebys-analytics-php)

## Limitations with Google BigQuery

Barnebys Analytics uses input streams to let BigQuery handle the buffering for you.
The known limitation is 100.000 writes/second and if you need more than that, you can request an
increase from Google by a 50.000 increase per request. 
