---
Title: Binding to Services in Cloud Foundry
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Tutorial

---

The *Services* module allows you to easily connect to services in the Cloud Foundry environment.

>**NOTE:** The module properly functions only in the Cloud Foundry environment. All the methods return `null` in a local environment. 

##Usage

To get the list of all services bound to your application, use the `getServices` method without parameters:

```js
var dspServices = require('factory').services;

var services = dspServices.getServices();


console.log(services);

// =>
// {
//  "dsp_uaa_v1-0.0.1": [
//     {
//       "name": "dsp-uaa",
//       "label": "dsp_uaa_v1-0.0.1",
//       "plan": "free",
//       "tags": [
//         "dsp_uaa_v1-0.0.1",
//         "dsp_uaa_v1"
//       ],
//       "credentials": {
//         "login_server_url": "http://some.server.dev"
//       }
//     }
//   ],
//   "logstash_4777_v1-v1": [
//     {
//       "name": "dsp-logstash",
//       "label": "logstash_4777_v1-v1",
//       "plan": "free",
//       "tags": [
//         "logstash_4777_v1-v1",
//         "logstash_4777_v1"
//       ],
//       "credentials": {
//         "host": "logstash_4777",
//         "port": 4777,
//         "app_id": "1"
//       }
//     }
//   ]
// }

```

To get a service by its key (or a part of the key), pass the key to the `getService` method as a parameter. For instance, to get `logstash_4777_v1-v1` service, pass 'logstash' to the `getService` method:

```js
var dspServices = require('factory').services;

var service = dspServices.getService('logstash');

console.log(service);

// =>
//  {
//    "name": "dsp-logstash",
//    "label": "logstash_4777_v1-v1",
//    "plan": "free",
//    "tags": [
//      "logstash_4777_v1-v1",
//      "logstash_4777_v1"
//    ],
//    "credentials": {
//      "host": "logstash_4777",
//      "port": 4777,
//      "app_id": "1"
//    }
//  }
```
