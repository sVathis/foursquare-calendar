# Foursquare Swarm check-ins as iCalendar (Azure Function)

This [Azure Function](https://docs.microsoft.com/en-us/azure/azure-functions/functions-overview) creates an [iCalendar](https://icalendar.org/) with all your [Foursquare Swarm](https://www.swarmapp.com/) check-ins as events. You can subscribe to this iCalendar from your favorite calendaring program and have calendar entries created on every check-in

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [Cloud deployment](#Cloud-deployment) for notes on how to deploy the project on Azure.

### Prerequisites

In order for this service to work you will need:

 1. A valid [Azure subscription](https://azure.microsoft.com/en-us/)
 2. An [Foursquare developer account](TODO: url)

You will also need the following software installed in your dev enviroment:

 1. [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/?view=azure-cli-latest)
 2. [Azure Function Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)
 3. [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) (required for Azure Functions Core Tools)

## Installing

### Foursquare API access

To use Foursquare APIs, you need to register with the [Foursquare Developer](https://developer.foursquare.com/) and create an application, using [this form](https://foursquare.com/developers/apps).

Generate a unique set of keys (a keyset) that will serve as your application’s credentials:

* Client ID: This uniquely identifies your application.
* Client Secret: This is a client secret (like a password for your Client ID), which should be kept confidential.
* Access Token: A unique access token

You should copy and save your keys locally in the [credentials.sh](credentials.sh) file, for use in this application, as follows:

```shell
FOURSQUARECLIENTID=<Client ID>
FOURSQUARECLIENTSECRET=<Client Secret>
FOURSQUAREACCESSTOKEN=<Access Token>
```

These credentials will be privatly uploaded to Azure as [App settings](https://docs.microsoft.com/en-us/azure/azure-functions/functions-app-settings) by the [bootstrap.sh](bootstrap.sh) script.

### node.js enviroment

Install locally all required modules as follows:

```shell
$ npm install
```

## Deploying

First you will need to set the values of the following variables in [definitions.sh](definitions.sh) file:

```shell
rgName=<Resource Group Name>
storageName=<Storage Account Name>
functionAppName=<FunctionApp Name>
location=<Location>
```

*Note*: `rgName` and `storageName` should be unique across your Azure subscription. `functionAppName` should be unique across Azure(!). `location` should be an [Azure Location](https://azure.microsoft.com/en-us/global-infrastructure/locations/) preferably be as close as possible to your physical location. 

### Local deployment

Before running this function localy for the **first time**, you will need to execute the [bootstrap.sh](bootstrap.sh) script:

```shell
$ ./bootstrap.sh
Done
```

This script will:

* create an Resource Group where all resources required for this function will belong
* create a Storage Account, required by the Azure Functions framework
* create the Azure Function App
* securely upload to Azure all Foursquare credentials as [App settings](https://docs.microsoft.com/en-us/azure/azure-functions/functions-app-settings)
* will fetch these app settings locally so that can be used for local function execution.

After bootstraping, the Azure Function can be executed locally as follows:

```shell
$ func host start
[23/1/2020 9:05:16 πμ] Host started (527ms)
[23/1/2020 9:05:16 πμ] Job host started
Hosting environment: Production
Content root path: C:\Users\SpyridonV\Code\foursquare-calendar
Now listening on: http://0.0.0.0:7071
Application started. Press Ctrl+C to shut down.

Http Functions:

        foursquare: [GET] http://localhost:7071/api/foursquare

        foursquareAll: [GET] http://localhost:7071/api/foursquare/all/

        foursquareByYear: [GET] http://localhost:7071/api/foursquare/year/{year}

        foursquareYears: [GET] http://localhost:7071/api/foursquare/years/{fromYear}/to/{toYear}

```

While the Azure Function is running locally, you can send an HTTP request towards the URL above ([http://localhost:7071/api/foursquare](http://localhost:7071/api/foursquare)) in order to retrieve your Foursquare Swarm check-ins in iCalendar format:

```shell
$ wget -4 http://localhost:7071/api/foursquare
--2020-01-23 11:08:10--  http://localhost:7071/api/foursquare
Resolving localhost (localhost)... 127.0.0.1
Connecting to localhost (localhost)|127.0.0.1|:7071... connected.
HTTP request sent, awaiting response... 200 OK
Length: unspecified [text/calendar]
Saving to: ‘foursquare’

foursquare                                [ <=>                                                                      ]  13.00K  --.-KB/s    in 0.001s

2020-01-23 11:08:13 (14.6 MB/s) - ‘foursquare’ saved [13311]

$ file foursquare
foursquare: vCalendar calendar file
```

### Cloud deployment

In order to publish to Azure, execute the [deploy.sh](deploy.sh) script:

```shell
$ ./deploy.sh
Getting site publishing info...
Creating archive for current directory...
Uploading 32,79 MB [##############################################################################]
Upload completed successfully.
Deployment completed successfully.
Syncing triggers...
Functions in foursquarecalendar:
    foursquare - [httpTrigger]
        Invoke url: https://<functionAppName>.azurewebsites.net/api/foursquare?code=<code>

    foursquareAll - [httpTrigger]
        Invoke url: https://<functionAppName>.azurewebsites.net/api/foursquare/all/?code=<code>

    foursquareByYear - [httpTrigger]
        Invoke url: https://<functionAppName>.azurewebsites.net/api/foursquare/year/{year}?code=<code>

    foursquareYears - [httpTrigger]
        Invoke url: https://<functionAppName>.azurewebsites.net/api/foursquare/years/{fromyear}/to/{toyear}?code=<code>
fUTZFBsQNqKEUayg==

```

After succesfull deployment you can send HTTPS request towards the `Invoke urls` above in order to retrieve your Foursquare Swarm check-ins in iCalendar format. You can use this `Invoke urls` to subscribe to this iCalendar in your favorite calendaring platform, e.g. [Google Calendar](https://support.google.com/calendar/answer/37100?co=GENIE.Platform%3DDesktop&hl=en) or [Outlook](https://support.office.com/en-us/article/Import-or-subscribe-to-a-calendar-in-Outlook-on-the-web-503ffaf6-7b86-44fe-8dd6-8099d95f38df).

## Usage

This Azure Function provides the following API endpoints:

### foursquare 

`https://<functionAppName>.azurewebsites.net/api/foursquare`

This endpoint returns current year's check-ins

### foursquareAll

`https://<functionAppName>.azurewebsites.net/api/foursquare/all/`

This endpoint returns all your FoursquareSwarm check-ins

### foursquareByYear

`https://<functionAppName>.azurewebsites.net/api/foursquare/year/{year}`

This endpoint returns all check-ins for the specified year `{year}`

### foursquareYears

`https://<functionAppName>.azurewebsites.net/api/foursquare/years/{fromyear}/to/{toyear}`

This endpoint returns all your FoursquareSwarm check-ins between `{fromyear}` and `{toyear}`

## Built With

* [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/?view=azure-cli-latest)
* [Azure Function Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)
* [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
* [node-foursquare](https://github.com/clintandrewhall/node-foursquare)
* [ics](https://github.com/adamgibbons/ics)

## Authors

* **Spiros Vathis** - github: [sVathis](https://github.com/sVathis) - Twitter: [@svathis](https://twitter.com/svathis)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
