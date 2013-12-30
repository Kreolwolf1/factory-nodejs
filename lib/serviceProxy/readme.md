---
Title: Exposing Backend Services to Frontend
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Tutorial
Image: assets/img/Actions-document-open-remote-icon.png
Tags: Services, Proxy, Backend, Java, Node.js
---

##Introduction

It is often necessary to expose a Backend service to the Frontend via a node.js application. The *ServiceProxy* module from the *factory-node.js* library allows you to easily do this by adding a route to your application and proxying requests to the Backend services via this route.

{{tip "Authentication information is passed by the ServiceProxy module automatically, so you don't have to do this manually."}}

>**Note**: You can proxy requests only to services within the same Cloud Foundry environment where your application runs.

##Usage

To expose a DSP service to the Frontend:

1. Initiate the `factory.serviceProxy` module;
2. Add proxied service descriptors;
3. Create the proxy and assign a route for proxied requests.

**Example**

```js
var express = require('express');

// Initiate the 'factory.serviceProxy' module
var serviceProxy = require('krot').serviceProxy;

var app = express();

// Add proxied services
serviceProxy.addProxiedServices({
    search: {
        host: 'someService.host.name.wmg.com',
        port: 80
    },
    otherServiceName: {
        host: 'otherService.host.name.wmg.com',
        port: 80
    }
});

// Create the proxy and assign a route for proxied requests 
serviceProxy.createProxy(app);

```

The `serviceProxy.addProxiedServices` method accepts service descriptors that should have two properties: `host` and `port`.

When `serviceProxy.createProxy` is called, it creates an *Express* route `/services/:name/*` which will handle all the proxied services.
>**Note**: Since the `createProxy` method assigns a route for your application, you had better invoke it only after all your middleware has been initialized.

## Consuming Proxied Services from Frontend

Proxied services are exposed to the Frontend at `yourapp.hostname/services/:name/*`, so if you want to send a *GET* request to the `someService` service available at, for example: 

    someService.host.name.wmg.com/api/v1/endpoint?query=foo

from the Frontend code, you can send your request to:

    yourapp.host.name.wmg.com/services/someService/api/v1/endpoint?query=foo

and it will be proxied to `someService` with an authentication header automatically added.

## Binding to Services in a Cloud Foundry Environment

In the above examples the service URLs are hardcoded, whereas in your applications you may want to bind to services in a Cloud Foundry environment using environment variables. The [*services*][1] module will help you do this:

```js
var url = require('url')
var krot = require('krot');

// initialize 'serviceProxy' and 'services' modules
var serviceProxy = krot.serviceProxy,
    services = krot.services;

// read connection information for the 'someService' service from environment variables
var connectionOptions = url.parse(services.getService('someService').credentials.conn);

// create the proxy and pass service host and port information
serviceProxy.addProxiedServices({
    search: {
        host: connectionOptions.host,
        port: connectionOptions.port || 80
    }
});

```

To learn more, visit [Binding to Services in Cloud Foundry][1].

[1]: devportal.devportal-ci.dspdev.wmg.com/docs/nodejs/tutorial/binding_to_services_in_cloud_foundry

