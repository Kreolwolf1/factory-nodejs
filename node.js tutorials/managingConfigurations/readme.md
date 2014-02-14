---
Title: Managing Configurations in node.js
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Tutorials
Tags: Node.js, configurations, config
---

##Introduction

Every application need to store some configuration information somehow. If you create a simple application, it could be enough
to store all information in simple js or json file and load it using *require* function. But when your application become bigger,
you start thinking about some useful features that you can get from configuration. For example: different behavior on different environment,
or you could think about writing config in yaml format, or for instance, including process arguments to the config automatically.
There are several modules that could solve all or some of those issue for you. So lets describe some of them

### [node-config] [1]

Lets you define a default set of application parameters, and tune them for different runtime environments (development, qa, staging, production, etc.).

####example

```
(example default.yaml file):

Customer:
  dbHost: localhost
  dbPort: 5984
  dbName: customers

(example production.yaml file):

Customer:
  dbHost: http://some.server.com
```

```
(example app.js file)
var config = require('config').Customer;

console.log(config.dbHost, config.dbPort, config.dbName);
```
Then if you execute app.js in production env
```
$ NODE_ENV=production app.js
```
It shows as
```
http://some.server.com 5984 customers
```

####pros: 
 - Supports hierarchical config structure
 - Could works with different config format such as js, json, yaml
 - Automatically load config for current NODE_ENV
 - A lot of stars and contributors on github last commit on 05/Feb/14

####cons:
 - could be configured only be environments variables(it can be eliminated by reassigning process.env object)

>**Note**: As you read before for configuration you have to use env variables so if for instance you want to change base config directory(by default module look for it in the porject root) you have to do following:

```
// set NODE_CONFIG_DIR env variable in order to setup config module
process.env.NODE_CONFIG_DIR =  __dirname + '/path/to/config';

var config = require('config').Customer;

console.log(config.dbHost, config.dbPort, config.dbName);
```
 

### [nconf] [2]

Hierarchical node.js configuration with files, environment variables, command-line arguments, and atomic object merging.

####example
```
var nconf = require('nconf');

//
// Setup nconf to use (in-order):
//   1. Command-line arguments
//   2. Environment variables
//   3. A file located at 'path/to/config.json'
//
nconf.argv()
   .env()
   .file({ file: 'path/to/config.json' });

// Set a few variables on `nconf`.
nconf.set('database:host', '127.0.0.1');
nconf.set('database:port', 5984);

// Get the entire database object from nconf. This will output
// { host: '127.0.0.1', port: 5984 }

console.log('foo: ' + nconf.get('foo'));
console.log('NODE_ENV: ' + nconf.get('NODE_ENV'));
console.log('database: ' + nconf.get('database'));
```

If you run the above script:
```
$ NODE_ENV=production sample.js --foo bar
```
The output will be:
```
foo: bar
NODE_ENV: production
database: { host: '127.0.0.1', port: 5984 }
```

####pros:
 - Can use process arguments and environment variable as config keys
 - It is easy to load on config json or just js object
 - Has api for rewriting config on runtime
 - Well supported last commit on 12/Feb/2014

####cons:
 - Supports json by default for config file (for other formats you have to provide parser)
 - Supports hierarchical config only on api level
 - Can't load config file depending on NODE_ENV

Could be very useful if you are planning to work with a lot of process arguments and env variable and rewrite configuration on runtime.

### [konphyg][3]

Cascading Environment based configuration. Very simple and straightforward

####example
```
// Initialize konphyg with the base config dir
var config = require('konphyg')(__dirname + '../config');

// Read the "redis" domain
var redisConfig = config('redis');
// Loading all configurations
var config = konphyg.all();
```

####pros:
 - Supports hierarchical config structure, (Supports additional levels of hierarchy like database.env.json or main.env.json)
 - Automatically load config for current NODE_ENV
 - Easy to setup and config

####cons:
 - Supports only json format for config
 - Not so well supported a few stars and contributors last commit was on september before that there had not been any commits for a year


##Conclusion

All of those libraries could be used in production. During the development of devportal we chose a **node-config** module for configuration management. Because it meats our requirements. It supports hierarchical structure of config based in NODE_ENV. It supports different formats for config file out of the box. It is well supported and it is quite simple to use.
 

[1]: https://github.com/lorenwest/node-config
[2]: https://github.com/flatiron/nconf
[3]: https://github.com/pgte/konphyg