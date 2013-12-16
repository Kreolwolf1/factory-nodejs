---
Title: How Java DSP Services Are Exposed to the Frontend?
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Tutorial
Image: assets/img/JavaDSP.jpg
Tags: Services, Proxy, Java Services, Node.js
---

##Introduction

Sometimes while developing a node.js application in the **wmg** environment you need to use Java DSP services in order to gain access to data that is stored in cassandra or elastic search. The *ServiceProxy* library that is found in the *factory-nodejs* module helps you deal with this issue.

*ServiceProxy* adds a route to your application. Requests that are sent to this route will be proxied to Java services. The authentication header will be added to such a request automatically.

>**Note**: You can proxy a request only to the Java services that are deployed to the same CloudFoundry environment where your application belongs.

##Usage

Take these steps to initialize the *ServiceProxy* library:

```js
var express = require('express');
var serviceProxy = require('factory').serviceProxy;

var app = express();

serviceProxy.addProxiedServices({
    someServiceName: {
        host: 'service.host.name.wmg.com',
        port: 80
    },
    otherServiceName: {
        host: 'otherService.host.name.wmg.com',
        port: 80
    }
});


serviceProxy.createProxy(app);

```

As you see in the above example, the `serviceProxy.addProxiedServices` method obtains services descriptions. Each service descriptor should have two options: `host` and `port`.

Another method, `serviceProxy.createProxy`, obtains the application object as a parameter and assign the route `/services/:name/*` 

where 

- name – is a variable that indicate the name of the service, which the request is sent to;
- /* – asterisk is where you specify the request that should be proxied (after the service name). 

So if you want to send this **get** request to the 'someServiceName' service:

`devportalsvc.devportal-ci.dspdev.wmg.com/api/v1/tutorials?query=bar`

You can send it to following URL:

`your.app.host.name/services/search/api/v1/tutorials?query=bar`

It will be proxied to `someServiceName` with the authentication header.


When you use the [*Services* library][1] from the factory, you do not need to hardcode services information. 
You can just obtain it from the CF environment:

```js
var url = require('url')
var factory = require('factory');

var serviceProxy = factory.serviceProxy,
    services = factory.services;

var connectionOptions = url.parse(services.getService('devportalsvc').credentials.conn);

serviceProxy.addProxiedServices({
    search: {
        host: connectionOptions.host,
        port: connectionOptions.port || 80
    }
});

```
In the above example we have just obtained connection information from the services that are built in the CF environment.

[1]: http://devportal.devportal-ci.dspdev.wmg.com/docs/nodejs/tutorial/binding_to_services_in_cloud_foundry
