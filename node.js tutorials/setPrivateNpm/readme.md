---
Title: Use of Private NPM Repository
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Tutorials
Tags: NPM, Registry, Private, Configuration
---

# Configuration

In order to be able to use private Node.js libraries, you need to make your NPM client connect to the Private NPM repo.

Run the following command in your terminal:

    npm config set registry http://10.70.99.217:8888


{{tip "The rest of the page is currently under construction." type="danger"}}


##Introduction

In WMG private github repository we have some modules that might be useful for node.js developers who wants to bootstrap their apps or easily integrates with WMG services. As examples of this modules are [factory-nodejs][1], [factory-handlebars-helpers][2] or [factory-cf-client][3]

You can install this modules using github links for instance in order to add factory-nodejs to your project, you should add dependency to your **package.json** like this:

        "krot": "git+ssh://git@github.com:wmgdsp/factory-nodejs.git#development"

But, since WMG has its own private npm registry you can easily tune your npm client and install wmg private packages for it as public ones

##Setting up

First off all WMG private npm registry could be found here

http://10.70.99.217:5984/registry/_design/scratch/_rewrite

So there are two ways how you can use private npm registry with you npm client.


**First**. You could just add **registry** flag to each npm command for instance

`npm --registry http://10.70.99.217:5894/registry/_design/scratch/_rewrite search krot`

should return information whether modules that contain 'krot' in name exist in private registry


**Second**. You could add registry option to your npm config by editing .npmrc (could be found in user folder) You have to add following line:

    registry = http://10.70.99.217:5984/registry/_design/scratch/_rewrite

Or you can use npm command for it:

    npm config set registry http://10.70.99.217:5984/registry/_design/scratch/_rewrite

After that, all your npm commands like npm install or search etc. will look for modules on wmg private registry. And in order to add some private wmg module to your node app you should add to you dependency list this:

    "wmg-module-name": "version"

And then `npm install` command installs all private and public modules from one registry

  [1]: https://github.com/wmgdsp/factory-nodejs
  [2]: https://github.com/wmgdsp/factory-handlebars-helpers
  [3]: https://github.com/wmgdsp/factory-cf-client
