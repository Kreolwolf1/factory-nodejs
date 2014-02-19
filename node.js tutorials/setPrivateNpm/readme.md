---
Title: Private NPM Repository
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Tutorials
Tags: NPM, Registry, Private, Configuration, Registry, Module
---

##Introduction

The WMG private NPM repository includes modules that help Node.js developers bootstrap their applications and easily integrate them with WMG services.

You can view published modules at http://10.70.99.217:5984/_utils/database.html?registry.

## <a id="config"></a> NPM Client Configuration

1. To make your NPM client use the WMG private NPM repository, run this command:

    `npm config set registry http://10.70.99.217:8888`

2. To check that the repository works as planned:

    `npm search krot`
    
3. It should return:

```
npm http GET http://10.70.99.217:8888/-/all/since?stale=update_after&startkey=1392213014516
npm http 200 http://10.70.99.217:8888/-/all/since?stale=update_after&startkey=1392213014516
NAME  DESCRIPTION AUTHOR     DATE              VERSION KEYWORDS
krot    =jenkins2  2014-02-06 14:38  0.0.7
```

If everyting went fine, running your npm commands such as `npm install`, `npm search`, will result in finding their corresponding modules in the WMG private NPM registry. 

## package.json

In order to add a private WMG module to your Node application, you need to add this line to your dependencies list in package.json:

    "wmg-module-name": "version" 

Then the `npm install` command will install all private and public modules from the specified registry.

## Advanced

This section contains information that you will not typically need during day-to-day development but that could be useful when something goes wrong or when you need to do something unusual.

### NPM Proxy

To make it possible to install both private and public NPM modules we are using a proxy that reaches out to public NPM repo, if the requested module is not found in the private one. 

The NPM proxy is located at http://10.70.99.217:8888. This is the address NPM clients should be using as described in the [NPM Client Configuration](#config) section.


### Various configuration methods

There are tree ways to make NPM client use the private NPM repository:

A. Run this command:

    npm config set registry  http://10.70.99.217:8888

B. Add the following line to the **.npmrc** file:

    registry = registry http://10.70.99.217:8888

C. If you cannot edit the **.npmrc** file, you can specify a registry manually on each npm execution.

For example, the following command will tell you, if NPM repo contains any modules that match with 'krot' query string.

    npm --registry http://10.70.99.217:8888 search krot
    

## Troubleshooting


### Unathorized error

If you were using another private NPM repo, you *may* get the following message:

     Error: unauthorized Name or password is incorrect
     
To fix this issue, first add your user by executing this command:

    npm adduser --registry http://10.70.99.217:5984/registry/_design/scratch/_rewrite
    
Then you can login with your credentials:

    npm login --registry http://10.70.99.217:5984/registry/_design/scratch/_rewrite

### Slow packages installation

If for any reason the NPM proxy does not work (or works slowly), you can run `npm install` with the default configuration. When you get all public modules and receive “cannot find private module” errors, you can run the following command to download private modules directly: 

	npm install --registry http://10.70.99.217:5984/registry/_design/scratch/_rewrite 

### Referencing Github repos

If nothing helps and you can't get the private NPM repository to work, you can install the modules using direct links to the corresponding GitHub repos. For example, to add **factory-nodejs** module to your project, add the following dependency to your **package.json**:

    "krot": "git+ssh://git@github.com:wmgdsp/factory-nodejs.git#development"




  [1]: https://github.com/wmgdsp/factory-nodejs
  [2]: https://github.com/wmgdsp/factory-handlebars-helpers
  [3]: https://github.com/wmgdsp/factory-cf-client
