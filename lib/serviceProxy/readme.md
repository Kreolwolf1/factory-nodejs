---
Title: How Java DSP Services Are Exposed to the Frontend?
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Tutorial
Image: assets/img/JavaDSP.jpg
Tags: Services, Proxy, Java Services, Node.js
---


###Introduction

Sometimes while developing node.js application in wmg environment you have to use Java DSP services in order to gain access to data that stored in cassandra or elastic search. ServiceProxy library that could be found in factory-nodejs  module could help you with this issue.

ServiceProxy add route to your application. Requests that will be sended to this route will be proxied to the Java Services. Authentication header would be added to request automatically.

>**Note**:  Notice, that we could proxy request only to that Java services that deployed to the same cloudfoundry environment where your application is.

###Usage

In order to initialize serviceProxy library you have to do following 

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

As you see in this example, method `serviceProxy.addProxiedServices` obtains services description. Each service descriptor should have two option host and port.

Another method `serviceProxy.createProxy` obtains application object as a parameter and assign url `/services/:name/*` where name is the name of a servise after name you have to specify request that should be proxied.

So if you want to send get request to service 'someServiceName' like this:

`service.host.name.wmg.com/api/v1/resources?foo=bar`

You could send request to following url:

`your.app.host.name/services/someServiceName/api/v1/resources?foo=bar`

And it would be proxied to someServiceName with authentication header.
