---
Title: Private NPM Repository
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Tutorials
Tags: NPM, Registry, Private, Configuration, Registry, Module
---

##Introduction

The WMG private NPM repository includes modules that help Node.js developers bootstrap their applications and easily integrate them with WMG services.

You can view the published modules at http://10.70.99.217:5984/_utils/database.html?registry.

## <a id="config"></a> NPM Client Configuration

1. To make your NPM client use the WMG private NPM repository, run this command:

    `npm config set registry http://10.70.99.217:8888`

2. To check that the repository works as planned:

    `npm search krot`
    
3. It should return:

```
npm http GET http://10.70.99.217:8888/-/all/since?stale=update_after&startkey=1392213014516
npm http 200 http://10.70.99.217:8888/-/all/since?stale=update_after&startkey=1392213014516
NAME DESCRIPTION AUTHOR DATE VERSION KEYWORDS
krot    =jenkins2  2014-02-06 14:38  0.0.7
```

If everything has gone well, running your npm commands such as `npm install`, `npm search`, will result in finding their corresponding modules in the WMG private NPM registry. 

## package.json

In order to add a private WMG module to your Node application, you need to add this line to your dependencies list in **package.json**:

    "wmg-module-name": "version" 

Then the `npm install` command will install all private and public modules from the specified registry.

## Advanced

This section contains information that you will not typically need during your day-to-day development but it could be useful when something goes wrong or when you need to do something unusual.

### NPM Proxy

To make it possible to install both private and public NPM modules we are using a proxy that reaches out to public NPM repo, if the requested module is not found in the private one. 

The NPM proxy is located at http://10.70.99.217:8888. This is the address NPM clients should be using as described in the [NPM Client Configuration](#config) section.


### Various Configuration Methods

There are three ways to make NPM client use the private NPM repository:

A. Run this command:

    npm config set registry  http://10.70.99.217:8888

B. Add the following line to the **.npmrc** file:

    registry = registry http://10.70.99.217:8888

C. If you cannot edit the **.npmrc** file, you can specify a registry manually when you execute npm.

For example, the following command will tell you if the NPM repo contains any modules that match a query for the **krot** query string.

    npm --registry http://10.70.99.217:8888 search krot
    

## Troubleshooting


### Unauthorized Error

If you were using another private NPM repo, you *may* get the following message:

     Error: unauthorized Name or password is incorrect
     
To fix this issue, first add your username by executing this command:

    npm adduser --registry http://10.70.99.217:5984/registry/_design/scratch/_rewrite
    
Then you can login with your credentials:

    npm login --registry http://10.70.99.217:5984/registry/_design/scratch/_rewrite

### Slow Packages Installation

If for any reason the NPM proxy does not work (or works slowly), you can run `npm install` with the default configuration. If you have already downloaded all public modules and receive “cannot find private module” errors, you can run the following command to download private modules directly: 

	npm install --registry http://10.70.99.217:5984/registry/_design/scratch/_rewrite 

### Referencing Github Repositories 

If nothing helps and you cannot get the private NPM repository to work, you can install the modules using direct links to the corresponding GitHub repos. For example, to add the **factory-nodejs** module to your project, add the following dependency to your **package.json**:

    "krot": "git+ssh://git@github.com:wmgdsp/factory-nodejs.git#development"




  [1]: https://github.com/wmgdsp/factory-nodejs
  [2]: https://github.com/wmgdsp/factory-handlebars-helpers
  [3]: https://github.com/wmgdsp/factory-cf-client
