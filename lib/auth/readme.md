---
Title: Authentication Module
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Node.js Components 
Tags: Authentication, Security, OAuth2, UAA, Credentials, User, Socket.io, WebSockets, Node.js
---
##Introduction

The *Authentication* module provides a simple way for developers to add integration with the User Account and Authentication (UAA) Server to *node.js* applications.

> The UAA is the identity management service for Cloud Foundry. Its primary role is to serve as an OAuth2 provider for issuing tokens for client applications to use when they act on the behalf of users. It can also authenticate users with their credentials and can act as an SSO service using those credentials (or others). It has endpoints for managing user accounts and for registering OAuth2 clients as well as other various management functions.

> The basic delegation model is described in the [OAuth2 specification][1]. You can also read more about the Cloud Foundry UAA component in [this article][2].

##Quick Start

###Installation

The *Authentication* module is a part of the *Node.js Factory* library. You need to include the library dependency in your **package.json** file in order to use the *Authentication* module:

```js
"krot": "git+ssh://git@github.com:wmgdsp/factory-nodejs.git#development",
"cloudfoundry": "*"
```

If you have the WMG private NPM repository installed, you just need to add:
 
```js
"krot": "*"
```

Then execute:

```
npm install krot
```

###Making your Application Secure

1\. Register your application in UAA. In order to do that, specify `clientId`, `clientSecret`, and UAA `URL` in the configuration file:

```js
//config.js
var cloudfoundry = require('cloudfoundry');
module.exports = {
    uaa: {
        clientId: 'devportal',
        clientSecret: 'appclientsecret',
        url: cloudfoundry.dsp_uaa_v1["dsp-uaa"].credentials.login_server_url
    }
}
```
{{tip "To use the above code on your local machine, you have to explicitly provide the UAA URL as opposed to a Cloud Foundry environment where it can be taken from the environment variable." type="info"}}


2\. Create a new instance of the `auth` object using the `Authentication` constructor and wire it up to your application:

```js
var Authentication = require('krot').auth.Authentication;
var auth = new Authentication(app);
```

3\. To make all your routes secure by default, set the **isAllUrlsSecure** option to `true`: 

```js
config.uaa.isAllUrlsSecure = true;
```

>**Note**: To have more granular control of your routes security, you can add the `ensureAuthenticated` middleware for each route that needs to be secure. Refer to the *Setting Routes Security on a Case-by-Case Basis* section for more details.

4\. Invoke the `use` method and pass the configuration object:

```js
auth.use(config.uaa);
```
5\. Invoke the `makeRoutes` method after all middlewares have been initialized to assign login, logout, and auth/callback routes:

```js
auth.makeRoutes();
```

>**Note**: Since inside the `auth.use` method we initialize the passport's middleware and it works with sessions, the `auth.use` method must be executed after initialization of a session's middleware. Also, it is important to use this function before router initialization; otherwise you could face passport errors. 

Here is the resulting *app.js* file:

```js
//app.js
var express = require('express');
var config = require('./config');

var Authentication = require('krot').auth.Authentication;
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

//makes '/login', '/logout' and '/auth/callback' routes 
auth.makeRoutes();
```

##Usage

###How It Works

The library uses [passport][3] and [passport-OAuth][4] under the hood. It provides the UAA authentication strategy that is inherited from the passport OAuth2 strategy and encapsulates the process of passport initialization for a developer. Also the library makes routes for login and logout and provides the `ensureAuthenticated` middleware that can check whether a user is authenticated or not.

The `auth` object provides the following functions:

1\. The UAA strategy constructor function that could be used if you want to implement your own authentication with the passport and UAA strategy:

```js
var krot = require('krot');

var Strategy = krot.auth.Strategy;
```

2\. The constructor function that instantiates the auth provider object:

```js
var Authentication = krot.auth.Authentication;
```

3\. The middleware for checking a user's authentication:

```js
// 
var ensureAuthenticated = krot.auth.ensureAuthenticated;
```

4\. The socket authorization provider:

```js
var socketAuthorization = krot.auth.socketAuthorization;
```

### Setting Routes Security on a Case-by-Case Basis

Add the `ensureAuthenticated` middleware for each route that needs to be secure.


```
var Authentication = require('krot').auth.Authentication;
var auth = new Authentication(app);

// add ensureAuthenticated middleware to the routes 
app.get('/', auth.ensureAuthenticated(), routes.index);

```

If your routes are created over several files, there is no need to instantiate the 'auth' object every time; you can use the `ensureAuthenticated` function directly, for example:

```js
var ensureAuthenticated = require('krot').auth.ensureAuthenticated;

app.get('/', ensureAuthenticated, routes.index);

```

### Making all Routes Secure

If all routes are meant to be secure in your application, there is no need to add a middleware to each of them; you can just add the **isAllUrlsSecure** option to their configuration and set it as `true`:

```js
config.uaa.isAllUrlsSecure = true;
auth.use(config.uaa);
```

After `ensureAuthenticated` has been initialized as a middleware for all the routes, it will redirect a user to the login page whenever this user has not been authenticated or if the URL is not found in the list of unsecure URLs. By default, this list contains only three URLs: `/login`, `/auth/callback`, and `/logout`, though you can extend this list using the `addUnsecureUrl` method:

```js
auth.addUnsecureUrl('/foobar');

// array is accepted too
auth.addUnsecureUrl(['/foo/bar', '/some/other/url']);
```




### User Object

After having added authentication to your application, you can obtain the `user` object from the `request` object in the route handler:

```js
app.get('/', ensureAuthenticated, function (request, response) {
    console.log(request.user);
});

```


###Getting Notification on Successful Authentication

There are two ways to execute your code after successful authentication:

* Add your listener to the `successLogin` event: 

```js
auth.on('successLogin', function (profile) {
    console.log('this is profile of authenticated user %j', profile);
});
```

* Re-define the `verifyAuth` method before the `use` method has been executed:

```js
auth.verifyAuth = function (accessToken, refreshToken, profile, done) {
    // some your custom logic
    done(null, profile);
};

```

###Authorizing a User on a WebSocket Connection

If you use [Socket.io][5] (or any module with the compatible API), you can run you handler when [Socket.io][5] is performing a handshake (the `Authentication` module provides you with such a handler):

```js
var io = require('socket.io'),
    express = require('express'),
    auth = require('krot').auth;

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

The `checkAuthorization` method receives `sessionStore`, `sessionKey` and `sessionSecret` as parameters and returns the checker function. [Socket.io][5] will invoke the checker function and pass the `socket.handshake` object and accept callback.

In the checker function we verify that headers contain the `someKey` cookie (see the sample above) and attempt to obtain the session by this cookie from the session store. If this session exists, we will verify that the user object has the access token.

If the session does not exist, an error is emitted. In the client code you can subscribe to it in the following way:

```js
var sio = io.connect();

sio.socket.on('error', function (reason){
  console.error('Unable to connect Socket.IO', reason);
});

```

Also, the `Authentication` module allows subscribing to the `successSocketLogin` event:

```js
socketAuth.on('successSocketLogin', function (user, handshake) {
    //your code
});
```

When using this event, you can add some information to the handshake object and then receive it on the connection event from the `socket.handshake` object.

### How to Associate the Current Socket Object with the User

The socket authorization and `successSocketLogin` event can be useful if you have to associate the current user with the socket object (for instance, in order to send some message from one user to someone else).

For such binding you can do the following:

```js

var io = require('socket.io'),
    socketAuth = require('krot').auth.socketAuthorization;

// some initital code

io.set('authorization', socketAuth.checkAuthorization(sessionStore,
    'someKey', 'someSecret'));

var userSocketMap = {};

socketAuth.on('successSocketLogin', function (user, handshake) {
    handshake.user = user;
});

io.on('connection', function(socket) {
    var handshake = socket.handshake;
    userSocketMap[handshake.user.name] = socket;
});

```
So as you see in the above example, we have added some user information to the handshake object in the `successSocketLogin` handler. And then it's easy to retrieve this data on a connection event when you have access to the user socket.

[1]: http://tools.ietf.org/html/draft-ietf-oauth-v2
[2]: http://blog.cloudfoundry.com/2012/07/23/introducing-the-uaa-and-security-for-cloud-foundry/
[3]: http://passportjs.org/
[4]: https://github.com/jaredhanson/passport-oauth
[5]: http://socket.io/
