---
Title: Exposing Backend Services to Frontend
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Tutorial
Image: assets/img/Actions-document-open-remote-icon.png
Tags: Services, Proxy, Backend, Java, Node.js
---

##Introduction

It is often necessary to expose a Backend service to Frontend via a node.js application. The *ServiceProxy* module from the *factory-nodejs* library allows you to easily do this by adding a route to your application and proxying requests to Backend services via this route.

{{tip "Authentication information is passed by the 'ServiceProxy' module automatically, so you don't have to do this."}}

>**Note**: You can proxy requests only to the services on the same CloudFoundry environment where your application runs.

##Usage

To expose a DSP service to Frontend:

1. Initiate the 'factory.serviceProxy' module;
2. Add proxied services descriptors;
3. Create the proxy and register it as a middleware.

**Example**

```js
var express = require('express');

// Initiate the 'factory.serviceProxy' module
var serviceProxy = require('factory').serviceProxy;

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

// Create the proxy and register it as a middleware
serviceProxy.createProxy(app);

```

The `serviceProxy.addProxiedServices` method accepts service descriptors which should have two properties: `host` and `port`.

When `serviceProxy.createProxy` is called, it register the proxy as a `Connect` middle and assign the route `/services/:name/*` to every registered service. 

## Consuming proxied services from Frontend

Proxied services are exposed to Frontend at `yourapp.hostname/services/:name/*`, so if you want to send the *GET* request to `someService` service available, for example, at 

    someService.host.name.wmg.com/api/v1/endpoint?query=foo

from the Frontend code you can you can send your request to

    yourapp.host.name.wmg.com/services/someService/api/v1/endpoint?query=foo

and it will be proxied to `someService` with the authentication header automatically added.

## Binding to services in Cloud Foundry environment

> Note that in the examples above the service URLs are hardcoded whereas in your applications you will want to bind to services in Cloud Foundry environment using environment variables. The [*services*][1] module will help you do this:

```js
var url = require('url')
var factory = require('factory');

// initialize 'serviceProxy' and 'services' modules
var serviceProxy = factory.serviceProxy,
    services = factory.services;

// read connection information for the 'devportalsvc' service from environment variables
var connectionOptions = url.parse(services.getService('devportalsvc').credentials.conn);

// create the proxy and pass service host and port information
serviceProxy.addProxiedServices({
    search: {
        host: connectionOptions.host,
        port: connectionOptions.port || 80
    }
});

```

To learn more, visit [Binding to Services in Cloud Foundry][1].

[1]: http://devportal.devportal-ci.dspdev.wmg.com/docs/nodejs/tutorial/binding_to_services_in_cloud_foundry
