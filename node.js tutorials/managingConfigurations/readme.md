---
Title: Managing Configurations in Node.js
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Tutorials
Tags: Node.js, Configurations, Module, JS, JSON 
---

##Introduction

Every application stores some configuration information. When it comes to a small and simple application, you might have all its configuration information stored
in a simple JS or JSON file and load it using the **require** function. 

When your application becomes bigger, you start thinking about useful features that you can get from its configuration. For example, you might want your application to have different behavior when running in different environment,
or you need to write configuration files in the YAML format, include process arguments to the configuration automatically, etc.


##Configuration Modules for Node.js

There are several configuration modules for Node.js. 
Each has their strengths and weaknesses, but no one can be regarded as the optimal configuration option for all use cases.  

###node-config

The [node-config] [1] module allows us to define a default set of application parameters and tune them for different runtime environments (development, qa, staging, production, etc.).

An example:

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
Then if you execute `app.js` in the production environment:
```
$ NODE_ENV=production app.js
```
The result will be displayed as: `http://some.server.com 5984 customers`.


**Pros**:
 
 - Supports the hierarchical configuration structure.
 - Can work with different configuration formats such as JS, JSON, YAML.
 - Automatically loads configuration for current **NODE_ENV**.
 - Has a lot of contributors on GitHub (the last commit was on 05/Feb/14).

**Cons**:

 - Can be configured only with environments variables (it can be eliminated by reassigning the **process.env** object).

>**Note**: You need to use **env** variables for configuration. When you want to change the configuration base directory (by default, the module looks for it in the porject root), take the following step:

```
// set NODE_CONFIG_DIR env variable in order to setup config module
process.env.NODE_CONFIG_DIR =  __dirname + '/path/to/config';

var config = require('config').Customer;

console.log(config.dbHost, config.dbPort, config.dbName);
```
 

### nconf 

The [nconf] [2] module provides hierarchical node.js configuration with files, environment variables, command-line arguments, and atomic object merging.

The following is a nconf configuration example:

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

**Pros**:

 - Can use process arguments and environment variables as configuration keys.
 - Makes it easy to load configuration: it is much easy to load configuration from a JSON file or just from a JS object.
 - Provides an API for rewriting configuration in runtime.
 - Is well supported (last commit was on February 12, 2014).

To sum up, **conf** can prove very useful if you plan to work with a lot of process arguments and env variables and rewrite configuration in runtime.  
 
**Cons**:

 - Supports only JSON by default for a configuration file (for other formats you have to provide a parser).
 - Supports hierarchical configuration only on the API level.
 - Cannot load a configuration file depending on **NODE_ENV**.



### konphyg

The [konphyg][3] module provides configuration based on a cascading environment. It is very simple and straightforward.

An example:

```
// Initialize konphyg with the base config dir
var config = require('konphyg')(__dirname + '../config');

// Read the "redis" domain
var redisConfig = config('redis');
// Loading all configurations
var config = konphyg.all(); 
```

**Pros**:

 - Supports the hierarchical configuration structure, (supports additional levels of hierarchy such as **database.env.json** or **main.env.json**).
 - Automatically loads configuration for the current **NODE_ENV**.
 - Makes it easy to setup and configure.

**Cons**:

 - Supports only the JSON format for configuration.
 - Poorly supported (few stars and contributors, the last commit was in September, 2013 - before that there had not been any commits for a year).


##Conclusion

Each of the above described libraries can be used in production. When it comes to the development of DevPortal, we use the  **node-config** module for configuration management. These are the main reasons for our selecting **node-config**: 

 - Meets our requirements.
 - Supports the hierarchical structure of configuration based on **NODE_ENV**.
 - Supports different formats for configuration file out of the box.
 - Is well supported and easy to use.
 
 

[1]: https://github.com/lorenwest/node-config
[2]: https://github.com/flatiron/nconf
[3]: https://github.com/pgte/konphyg