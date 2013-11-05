---
Title: Authentication Module
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Tutorial

---
#Authentication Module

Authentication Module provides a simple way for developers to add integration with  User Account and Authentication (UAA) authentication to the ***node.js*** applications.

##Quick start

###Installation

Authentication Module is part of the Node.js Factory Library, therefore in order to use it you need to include the dependency on the Factory Library to your **package.json** file:

```js
"factory": "git+ssh://git@github.com:wmgdsp/factory-nodejs.git#development",
"cloudfoundry": "*"
```

If you have WMG private npm repository installed you just need to add:

```js
"factory": "*"

```

Then you need to execute:

```
npm install factory
```

###Simple Usage

In configuration file you need to add specify the 'client_id' and the 'client_secret' used to register your application in UAA as well as the UAA URL. As shown below, the UAA URL should be obained from the Cloud Founcry environment variable:

```js
//config.js
var cloudfoundry = require('cloudfoundry');
module.exports = {
    uaa: {
        client_id: 'devportal',
        client_secret: 'appclientsecret',
        url: cloudfoundry.dsp_uaa_v1["dsp-uaa"].credentials.login_server_url
    }
}

```

>**Improtant** If you are going to use this code on your local machine you have to provide direct uaa url instead of
url from cloudfoundry credentials


```js
//app.js
var config = require('./config');
var Authentication = require('factory').auth.Authentication;
var app = express();

// Create an instance of auth provider
var auth = new Authentication(app);

app.use(express.session());

// invoke use method with UAA credentials that initialize passport and makes '/login'
// and '/logout' routes 
auth.use(config.uaa);

app.use(app.router);

// add ensureAuthenticated middleware to the routes 
app.get('/', auth.ensureAuthenticated(), routes.index);

```

If you would like to make all your routes secure by default you just need to set the **isAllUrlsSecure** option to 'true':

```js
config.uaa.isAllUrlsSecure = true;
auth.use(config.uaa);
```

If you would like to have more granular control of your routes security, you can add 'ensureAuthenticated' middleware for each route that needs to be secure. Please see more detailes in the next section.


##Detailed info

###What is UAA

UAA is a Cloud Foundry service that is responsible for securing the platform services and providing a single sign-on (SSO) for web applications. The primary role of the UAA component is to serve as an OAuth2 authorization server. 

The basic delegation model is described in the [OAuth2 specification](http://tools.ietf.org/html/draft-ietf-oauth-v2). You can also read more about the Cloud Foundry UAA component in [this article](http://blog.cloudfoundry.com/2012/07/23/introducing-the-uaa-and-security-for-cloud-foundry/).

###How It Works

The library uses [passport](http://passportjs.org/) and [passport-OAuth](https://github.com/jaredhanson/passport-oauth) under the hood. It just provides the UAA authentication strategy that is inherited from the passport OAuth2 strategy and encapsulates the process of passport initialization from a developer. Also the library makes routes for login and logout and provides the ***ensureAuthenticated*** middleware  that can check whether a user is authenticated or not.

To summarize, the auth object provides three functions:

```js

// UAA strategy constructor function that could be used if you want to implement your own 
// authentication with passport and UAA strategy
var Strategy = require('factory').auth.Strategy;


// constructor function that instantiates the auth provider object
var Authentication = require('factory').auth.Authentication;

// middleware for checking user authentication
var ensureAuthenticated = require('factory').auth.ensureAuthenticated;
```

###How to Add Authentication to Your Application

You need to add a few lines of code into your ***app.js*** file and use the middleware on those routes that are supposed to be secure:


```js
//config.js
var cloudfoundry = require('cloudfoundry');
module.exports = {
    uaa: {
        client_id: 'devportal',
        client_secret: 'appclientsecret',
        url: cloudfoundry.dsp_uaa_v1["dsp-uaa"].credentials.login_server_url
    }
}

```

```js
//app.js

var express = require('express');
var config = require('./config');

// some code...

var Authentication = require('factory').auth.Authentication;
var app = express();

// instantiate auth object using an Authentication constructor
var auth = new Authentication(app);

// some code... 

app.use(express.session());

// invoke use method with UAA credentials that initialize passport and makes '/login'
// and '/logout' routes 
auth.use(config.uaa);

app.use(app.router);


// some code

// add ensureAuthenticated middleware to the routes 
app.get('/', auth.ensureAuthenticated(), routes.index);

```
So what you need to do is to create an instance of the *Authentication* constructor, execute the use method with UAA credentials, and add the ***ensureAuthenticated*** middleware to the routes.

>**Improtant** Since inside the ***auth.use*** method we initialize the passport's middleware and it works with sessions, we need to execute the ***auth.use()*** method after initialization of a session's middleware. Also it is important to use this function before router initialization, otherwise you could face passport errors. 

If routes are assigned in your application to a separate file, you do not need to instantiate the auth object for the middleware. You could just get it as a function.

```js
var ensureAuthenticated = require('factory').auth.ensureAuthenticated;

app.get('/', ensureAuthenticated, routes.index);

```

###If all routes are meant to be secure

If all routes are meant to be secure in your application, there is no need to add the middleware to each of them; you can just add and set the ***isAllUrlsSecure*** option to "true".

```js
config.uaa.isAllUrlsSecure = true;
auth.use(config.uaa);
```

After ***ensureAuthenticated*** has been initialized as a middleware for all the routes, it will redirect a user to the login page when this user has not been authenticated or the URL is not found in the list of unsecure URLs. By default this list contains only three URLs: '/login', '/auth/callback', '/logout', but you can extend this list using the ***addUnsecureUrl*** method.

```js
auth.addUnsecureUrl('/foobar');

//or just
auth.addUnsecureUrl(['/foo/bar', '/some/other/url']);

```

###How to execute your code after authentication

If you want to execute your code after successful authentication, there are two ways to do so. First, you can add your listener to the ***successLoginevent*** event.

```js
auth.on('successLogin', function (profile) {
    console.log('this is profile of authenticated user %j', profile);
});

```
The other way is to redefine the ***verifyAuth*** method before the ***use*** method has been executed.

```js
auth.verifyAuth = function (accessToken, refreshToken, profile, done) {
    // some your custom logic
    done(null, profile);
};

```

