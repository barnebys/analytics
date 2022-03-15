# Barnebys Analytics

A micro tracker for any events like clicks, leads and impressions.
Micro service design and built on [Micro](https://github.com/zeit/micro) from [Zeit](https://github.com/zeit). [Google BigQuery](https://cloud.google.com/bigquery/)
is used for storage and currently the only option. Barnebys Analytics is also referred to as BA.

## Parameters

    s = signature *
    p = programId *
    k = kind *
    a = affiliate
    url = url
    d1-d5 = dimension1-5
    sp = sponsored

    * is mandatory

## How to track

BA is a flexible tracker where you as a user define your own rules to track an event. To some extent.

To track clicks (or any other event that you might wanna track) you just need to use the
mandatory parameters. If no URL was specified the tracker will respond with an empty pixel. When you
need to keep track on leads use the affiliate `a` parameter to drop a cookie. The next time an event occurs
from the same visitor a lead event will be tracked. Default session length is 1h but it's customizable trough
an environment variable. The `kind parameter is then used for separating you'r different events.

When needed to segment your events specify a value for the predefined dimensions (`d1` to `d5`). Which can be used
to filter and/or segment your tracked events.

**Click tracking example**

`analytics.mydomain.com/r/collect?_h=track&p=<programId>&d1=<dimension1>&k=click&url=https://github.com&s=<hash>`

**Lead tracking example**

`analytics.mydomain.com/r/collect?_h=trackp=<programId>&k=click&url=https://yoursite.com&a=1&s=<hash>`

**Pixel tracking example**

`analytics.mydomain.com/r/collect?_h=track?p=<programId>&k=impressionk&s=<hash>`

## Hash for security

BA enforces you to sign each url. This prevents anyone to spoof or manipulate your tracking events.
By getting the md5 of `${secret} + ${uri}` and appending that hash to the uri with the `s` parameter BA keeps your tracking links secured.

## Installation & run

1. Create a Google Big Query project on Google Cloud
2. Create a dataset named `tracking` in Google Big Query
3. Create a service account with admin permissions and fetch the json configuration
4. Drop the json configuration as key.json in the `api/` directory
5. Adjust settings for dotenv if needed
6. Run `now env`

## Deployment with Now

You can deploy to any node compatible machine but for ease and scalability we suggest using [Now](https://zeit.co/now).

```
now
```

## Environment Settings

`SECRET` your secret key for creating hashes
`SESSION_NAME` your cookie name for sessions
`SESSION_MAX_AGE` max age for your sessions
`SITE_URL` optional, used for redirecting invalid requests to your dashboard or site

## Clients / Libraries

[Barnebys Analytics PHP](https://github.com/barnebys/analytics-php)

## Conversion Tracking

[See the documentation](docs)

## Limitations with Google BigQuery

BA uses input streams to let BigQuery handle the buffering for you.
The known limitation is 100.000 writes/second and if you need more than that, you can request an
increase from Google by a 50.000 increase per request.
