---
Title: DSP Services Module
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Tutorial

---

##DSP Services library

Services library get you possibility to easyly connect to cloud foundry services that added to your environment.

>**Improtant** Since library obtains services data from cloudfoundry environment variable in the localhost all methods just return null

##Usage

You can get a list of all services that binded to your application usin method ***getServices***

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

You also can get some service by its key or just a part of a key. So for instance if we want to get service 'logstash_4777_v1-v1' you could use ***getService*** method

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


If you want to definitely specify the version of service you can provide to the funtcion a full key name like:


```js

var service = dspServices.getService('logstash_4777_v1-v1');

```