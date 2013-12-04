---
Title: Authentication Module
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Tutorial
Image: assets/img/Keys-icon.png
Tags: Authentication, Security, OAuth2, UAA, Credentials, User, Socket.io, WebSockets, Node.js
---
##Introduction

The *Authentication* module provides a simple way for developers to add integration with the User Account and Authentication (UAA) Server to *node.js* applications.

> The UAA is the identity management service for Cloud Foundry. Its primary role is as an OAuth2 provider, issuing tokens for client applications to use when they act on behalf of users. It can also authenticate users with their credentials, and can act as an SSO service using those credentials (or others). It has endpoints for managing user accounts and for registering OAuth2 clients, as well as various other management functions.

> The basic delegation model is described in the [OAuth2 specification][1]. You can also read more about the Cloud Foundry UAA component in [this article][2].

##Quick Start

###Installation

The *Authentication* module is a part of the *Node.js Factory Library*. You need to include dependency on the library in your **package.json** file in order to use the Authentication module:

```js
"factory": "git+ssh://git@github.com:wmgdsp/factory-nodejs.git#development",
"cloudfoundry": "*"
```

If you have the WMG private NPM repository installed, you just need to add:
 
```js
"factory": "*"
```

Then execute:

```
npm install factory
```

###Making your application secure

1\. Register your application in UAA. In order to do that specify `client_id`, `client_secret`, and UAA `URL` in the configuration file:

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
{{tip "To use this code on your local machine, you have to explicitly provide the UAA URL as opposed to Cloud Foundry environment where it could be taken from the environment variable." type="info"}}


2\. Create a new instance of the `auth` object using `Authentication` constructor and wire it up with your application:

```js
var Authentication = require('factory').auth.Authentication;
var auth = new Authentication(app);
```

3\. To make all your routes secure by default set the **isAllUrlsSecure** option to 'true': 

```js
config.uaa.isAllUrlsSecure = true;
```

> To have more granular control of your routes security, you can add the `ensureAuthenticated` middleware for each route that needs to be secure. Refer to "*Setting routes security on a case-by-case basis*" section for more details.

4\. Invoke `use` method and pass configuration object:

```js
auth.use(config.uaa);
```

>**Note**: Since inside the `auth.use` method we initialize the passport's middleware and it works with sessions, the `auth.use` method must be executed after initialization of a session's middleware. Also, it is important to use this function before router initialization; otherwise you could face passport errors. 

Here is the resulting *app.js* file:

```js
//app.js
var express = require('express');
var config = require('./config');

var Authentication = require('factory').auth.Authentication;
var app = express();

// Create a new instance of the `auth` object using `Authentication` constructor 
// and wire it up with your application
var auth = new Authentication(app);

app.use(express.session());

// Make all routes secure by default
config.uaa.isAllUrlsSecure = true;

// invoke use method with UAA credentials that initialize passport and makes '/login'
// and '/logout' routes 
auth.use(config.uaa);

app.use(app.router);
```

##Usage

###How It Works

The library uses [passport][3] and [passport-OAuth][4] under the hood. It provides the UAA authentication strategy that is inherited from the passport OAuth2 strategy and encapsulates the process of passport initialization from a developer. Also the library makes routes for Login and Logout and provides `ensureAuthenticated` middleware that can check whether a user is authenticated or not.

The `auth` object provides the following functions:

1\. UAA strategy constructor function that could be used if you want to implement your own authentication with passport and UAA strategy:

```js
var factory = require('factory');

var Strategy = factory.auth.Strategy;
```

2\. Constructor function that instantiates the auth provider object:

```js
var Authentication = factory.auth.Authentication;
```

3\. Middleware for checking user authentication:

```js
// 
var ensureAuthenticated = factory.auth.ensureAuthenticated;
```

4\. Socket authorization provider:

```js
var socketAuthorization = factory.auth.socketAuthorization;
```

### Setting routes security on a case-by-case basis

Add the `ensureAuthenticated` middleware for each route that needs to be secure.


```
...

var Authentication = require('factory').auth.Authentication;
var auth = new Authentication(app);

// add ensureAuthenticated middleware to the routes 
app.get('/', auth.ensureAuthenticated(), routes.index);

```

If your routes are created in several files, there is no need to instantiate the 'auth' object every time; you can use `ensureAuthenticated` function directly, for example:

```js
var ensureAuthenticated = require('factory').auth.ensureAuthenticated;

app.get('/', ensureAuthenticated, routes.index);

```

### Making all the routes secure

If all routes are meant to be secure in your application, there is no need to add a middleware to each of them; you can just add the **isAllUrlsSecure** option to configuration and set it to `true`:

```js
config.uaa.isAllUrlsSecure = true;
auth.use(config.uaa);
```

After `ensureAuthenticated` has been initialized as a middleware for all the routes, it will redirect a user to the login page when this user has not been authenticated or the URL is not found in the list of unsecure URLs. By default, this list contains only three URLs: `/login`, `/auth/callback`, and `/logout`, though you can extend this list using the `addUnsecureUrl` method:

```js
auth.addUnsecureUrl('/foobar');

// array is accepted too
auth.addUnsecureUrl(['/foo/bar', '/some/other/url']);
```




### User object

After having added authentication to your application, you can obtain the `user` object from the `request` object in the route handler:

```js
app.get('/', ensureAuthenticated, function (request, response) {
    console.log(request.user);
});

```


###Getting notification on successful authentication

There are two ways to execute your code after successful authentication:

* Add your listener to the `successLogin` event: 

```js
auth.on('successLogin', function (profile) {
    console.log('this is profile of authenticated user %j', profile);
});
```

* Redefine the `verifyAuth` method before the `use` method has been executed:

```js
auth.verifyAuth = function (accessToken, refreshToken, profile, done) {
    // some your custom logic
    done(null, profile);
};

```

###Authorizing a user on WebSocket connection

If you use [Socket.io][5] (or any module with the compatible API), you can run you handler when [Socket.io][5] is performing a handshake (the `Authentication` module provides you with such a handler):

```js
var io = require('socket.io'),
    express = require('express'),
    auth = require('factory').auth;

var MemoryStore = express.session.MemoryStore;
var sessionStore = new MemoryStore();
var Authentication = auth.Authentication;

var app = express();
var auth = new Authentication(app);

app.use(express.session({
    key: 'someKey',
    secret: 'someSecret',
    store: sessionStore
}));

auth.use(config.uaa);

var server = require('http').createServer(app)

io.listen(server);

var socketAuth = auth.socketAuthorization;

io.set('authorization', socketAuth.checkAuthorization(sessionStore,
    'someKey', 'someSecret'));

```

### How It Works

The `checkAuthorization` method receives `sessionStore`, `sessionKey` and `sessionSecret` as parameters and returns a checker function. [Socket.io][5] will invoke the checker function and pass the `socket.handshake` object and accept callback.

In the checker function we verify that headers contain the 'someKey' cookie (see sample above) and attempt to obtain the session by this cookie from the session store. If such a session exists, we will verify that user object has the access token.

If session does not exist, an error is emitted. In the client code you can subscribe to it the following way:

```js
var sio = io.connect();

sio.socket.on('error', function (reason){
  console.error('Unable to connect Socket.IO', reason);
});

```

Also, the `Authentication` module allows subsribing to `successSocketLogin` event:

```js
socketAuth.on('successSocketLogin', function (user, handshake) {
    //your code
});
```

When using this event, you can add some information to the handshake object and then receive it on the connection event from the `socket.handshake` object.


[1]: http://tools.ietf.org/html/draft-ietf-oauth-v2
[2]: http://blog.cloudfoundry.com/2012/07/23/introducing-the-uaa-and-security-for-cloud-foundry/
[3]: http://passportjs.org/
[4]: https://github.com/jaredhanson/passport-oauth
[5]: http://socket.io/
