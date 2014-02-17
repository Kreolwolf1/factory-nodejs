---
Title: Use of Private NPM Repository
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Tutorials
Tags: NPM, Registry, Private, Configuration, Registry, Module
---



##Introduction

The WMG private GitHub repository includes modules that help node.js developers bootstrap their applications or easily integrate them with WMG services.     

Since WMG has their own private NPM registry, you can easily tune your NPM client and install WMG private packages as public ones.

The WMG private NPM registry is found at this link: http://10.70.99.217:5984/registry/_design/scratch/_rewrite

> **Note**: Although the WMG private NPM registry can be used directly to publish and install modules, you can also push your changes to GitHub: they will be published automatically. 

{{tip "Make sure that a module version in package.json is updated. Otherwise, the module will not be published." type="notice"}}


##Adding NPM Repository

1. To add the WMG private NPM repository as a registry, run this command:

    `npm config set registry http://10.70.99.217:8888`

2. Check if the repository works as planned:

    `npm search krot`
    
3. It should return:

```
npm http GET http://10.70.99.217:8888/-/all/since?stale=update_after&startkey=1392213014516
npm http 200 http://10.70.99.217:8888/-/all/since?stale=update_after&startkey=1392213014516
NAME  DESCRIPTION AUTHOR     DATE              VERSION KEYWORDS
krot    =jenkins2  2014-02-06 14:38  0.0.7
```


## Modules Currently Found in Repository

You can view the modules that are currently stored in the WMG private NPM repository here: http://10.70.99.217:5984/_utils/database.html?registry.

These are examples of these modules: [factory-nodejs][1], [factory-handlebars-helpers][2] or [factory-cf-client][3].

## NPM Proxy

The WMG private NPM registry contains only its own components. 

The NPM proxy allows you to transparently install from private and public registries packages, which are not found in the WMG registry.   

The NPM proxy is found here http://10.70.99.217:8888. It can be used for NPM client configuration.


## Installation Modules from Repository

The installation of required dependencies from a private repository requires some tuning of a NPM client as described below.

## Configuration

To use Node.js libraries, you need to connect your NPM client to the WMG private NPM repository.

You can add a registry to your npm configuration by editing the **.npmrc** file that is found in the user folder.  Add the following line:

    registry = registry http://10.70.99.217:8888

You can also use this npm command for that purpose:

    npm config set registry registry http://10.70.99.217:8888


After that, running your npm commands such as `npm install`, `npm search`, etc. will result in “finding” their corresponding modules in the WMG private NPM registry. 

In order to add a private WMG module to your Node application, you need to add this line to your dependencies list:

    "wmg-module-name": "version" 


Then the `npm install` command will install all private and public modules from the specified registry.

If you cannot edit the **.npmrc** file, you can specify a registry manually on each npm execution.

For that purpose, you can just add a registry's flag to each of the npm commands that you run. 

For example, the following command will return the information whether modules that contain 'krot' in their names are stored in the specified private registry.  

    npm --registry http://10.70.99.217:8888 search krot


## Troubleshooting

In case when you have been previously signed in with any other private repository, you can get an error message. For example:

     Error: unauthorized Name or password is incorrect
     
To fix this issue, you can add your user by executing this command:

    npm adduser --registry http://10.70.99.217:5984/registry/_design/scratch/_rewrite
    
Then you can login with your credentials:

    npm login --registry http://10.70.99.217:5984/registry/_design/scratch/_rewrite

If for any reason the NPM proxy does not work (or works slowly), you can run `npm install` with the default configuration. When you get all public modules and receive “cannot find private module” errors, you can run the following command to download private modules directly: 

	npm install --registry http://10.70.99.217:5984/registry/_design/scratch/_rewrite 

If the WMP private repository does not work, you can install the modules using GitHub links. To add **factory-nodejs** to your project, add the dependency to your **package.json**:

    "krot": "git+ssh://git@github.com:wmgdsp/factory-nodejs.git#development"




  [1]: https://github.com/wmgdsp/factory-nodejs
  [2]: https://github.com/wmgdsp/factory-handlebars-helpers
  [3]: https://github.com/wmgdsp/factory-cf-client
