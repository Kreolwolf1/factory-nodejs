---
Title: Use of Private NPM Repository
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Tutorials
Tags: NPM, Registry, Private, Configuration
---

#Introduction

In WMG private github repository we have some modules that might be useful for node.js developers who wants to bootstrap their apps or easily integrates with WMG services.

You can install this modules using github links for instance in order to add factory-nodejs to your project, you should add dependency to your **package.json** like this:

        "krot": "git+ssh://git@github.com:wmgdsp/factory-nodejs.git#development"

But, since WMG has its own private npm registry you can easily tune your npm client and install wmg private packages for it as public ones

WMG private npm registry could be found here http://10.70.99.217:5984/registry/_design/scratch/_rewrite

This registry can be used to publish and install modules directly but if you a module developer you can just push your changes to Github and they will be published automatically.

{{tip "Make sure that module version in package.json was updated. Otherwise module will not be published." type="notice"}}

## Modules currently in repository

Currently presented modules can be reviewed here http://10.70.99.217:5984/_utils/database.html?registry

As examples of this modules are [factory-nodejs][1], [factory-handlebars-helpers][2] or [factory-cf-client][3]

## NPM Proxy

As WMG own private npm registry only contains own components there is a npm proxy. This proxy allows transparently install private and public registries.

Proxy can be found here http://10.70.99.217:8888 and should be used for npm client configuration.

## Installing modules from repository

Install required dependencies from private repository is the same as usual installation routine, but require some tuning of npm client described below.

## Configuration

In order to be able to use private Node.js libraries, you need to make your NPM client connect to the Private NPM repo.

You could add registry option to your npm config by editing .npmrc (could be found in user folder) You have to add following line:

    registry = registry http://10.70.99.217:8888

Or you can use npm command for it:

    npm config set registry registry http://10.70.99.217:8888

After that, all your npm commands like npm install or search etc. will look for modules on wmg private registry. And in order to add some private wmg module to your node app you should add to you dependency list this:

    "wmg-module-name": "version"

And then `npm install` command installs all private and public modules from one registry

If in some cases you can not change .npmrc you can set registry manually on each npm execution.

You could just add **registry** flag to each npm command for instance

    npm --registry http://10.70.99.217:8888 search krot

should return information whether modules that contain 'krot' in name exist in private registry

## Troubleshooting

If by some reason proxy is not working (or working slow) for you can run `npm install` as usual with default configuration. After you get all public modules and get an errors finding private modules you can run `npm install --registry http://10.70.99.217:5984/registry/_design/scratch/_rewrite` to donwload private modules directly.


  [1]: https://github.com/wmgdsp/factory-nodejs
  [2]: https://github.com/wmgdsp/factory-handlebars-helpers
  [3]: https://github.com/wmgdsp/factory-cf-client
