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


## Deployment to Azure Kubernetes Service (AKS)

You can deploy Barnebys Analytics to Azure Kubernetes Service (AKS) for scalable, managed container orchestration. Below is a high-level guide to get started:

1. **Create an AKS Cluster**
   - Use the [Azure Portal](https://portal.azure.com/) or Azure CLI:
     ```sh
     az aks create --resource-group <ResourceGroup> --name <AKSClusterName> --node-count 2 --enable-addons monitoring --generate-ssh-keys
     ```
2. **Build and Push Docker Image**
   - Build your Docker image and push it to [Azure Container Registry (ACR)](https://azure.microsoft.com/en-us/products/container-registry/) or Docker Hub:
     ```sh
     docker build -t <acr-name>.azurecr.io/ba-analytics:latest -f docker/Dockerfile_prod .
     az acr login --name <acr-name>
     docker push <acr-name>.azurecr.io/ba-analytics:latest
     ```
3. **Configure Kubernetes Manifests**
   - Deployment manifests are provided in the `deploy` folder (see `deploy/deploy-scripts/` for production and staging examples). Update the image reference in these YAML files to your pushed image as needed.
4. **Deploy to AKS**
   - Connect to your AKS cluster and apply the manifests:
     ```sh
     az aks get-credentials --resource-group <ResourceGroup> --name <AKSClusterName>
     kubectl apply -f deploy/deploy-scripts/analytics-prod.yml
     ```
5. **Set Environment Variables and Secrets**
   - Use Kubernetes secrets and config maps for sensitive data (e.g., Google BigQuery credentials, app secrets).
6. **Monitor and Scale**
   - Use Azure Monitor and Kubernetes tools to monitor and scale your deployment as needed.

For more details, see the [Azure AKS documentation](https://docs.microsoft.com/en-us/azure/aks/).

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
