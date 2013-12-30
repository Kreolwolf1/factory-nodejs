---
Title: Binding to Services in Cloud Foundry
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Tutorial
Image: assets/img/Editing-Attach-icon.png
Tags: Services, Cloud Foundry, Node.js
---

##Introduction

The *Services* module allows you to easily connect to services in the Cloud Foundry environment.

> Services (or User Provided Service Instances) are containers with some data that could be added to any application in your environment. For instance you have Redis database that managed outside of, and unknown to Cloud Foundry. Rather than hard coding credentials for this database into your applications, you can create a service instance in Cloud Foundry. Than if you are developer of application that is supposed to work with your DB, you could add this service to your app and get access to credentials using our library. More information about User Provided Service Instances could be found [here][1].

>**NOTE:** The module properly functions only in the Cloud Foundry environment. All the methods return `null` in a local environment. 

##Usage

To get the list of all services bound to your application, use the `getServices` method without parameters:

```js
var dspServices = require('krot').services;

var services = dspServices.getServices();

console.log(services);
```

Output:
```js
{
 "dsp_uaa_v1-0.0.1": [
 {
   "name": "dsp-uaa",
   "label": "dsp_uaa_v1-0.0.1",
   "plan": "free",
   "tags": [
     "dsp_uaa_v1-0.0.1",
     "dsp_uaa_v1"
   ],
   "credentials": {
     "login_server_url": "http://some.server.dev"
   }
 }
  ],
  "logstash_4777_v1-v1": [
 {
   "name": "dsp-logstash",
   "label": "logstash_4777_v1-v1",
   "plan": "free",
   "tags": [
     "logstash_4777_v1-v1",
     "logstash_4777_v1"
   ],
   "credentials": {
     "host": "logstash_4777",
     "port": 4777,
     "app_id": "1"
   }
 }
  ]
}

```

To get a service by its key (or a part of the key), pass the key to the `getService` method as a parameter. For instance, to get `logstash_4777_v1-v1` service, pass 'logstash' to the `getService` method:

```js
var dspServices = require('krot').services;

var service = dspServices.getService('logstash');

console.log(service);
```

Output:
```js
{
  "name": "dsp-logstash",
  "label": "logstash_4777_v1-v1",
  "plan": "free",
  "tags": [
    "logstash_4777_v1-v1",
    "logstash_4777_v1"
  ],
  "credentials": {
    "host": "logstash_4777",
    "port": 4777,
    "app_id": "1"
  }
}
```
###Example: binding to UAA

In this example we use `dspServices.getService` method to obtain the UAA Service that helps us to determine the URL of the UAA Login Server:

```js
// Obtain the service
var uaaService = require('krot').services.getService('dsp_uaa');

// Get the UAA Login Server URL from the service credentials
var uaaURL = uaaService.credentials.login_server_url);

var Authentication = require('krot').auth.Authentication;
var auth = new Authentication(app);

auth.use({
    client_id: 'devportal',
    client_secret: 'appclientsecret',
    url: uaaURL
});

```


[1]: http://docs.cloudfoundry.com/docs/using/services/user-provided.html
