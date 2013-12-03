---
Title: Authentication Module
Author: Eugene Tsypkin
DevCenter: Node.js
Section: Tutorial

---
##Introduction

The *Authentication* module provides a simple way for developers to add integration with the User Account and Authentication (UAA) Server to *node.js* applications.

> The UAA is the identity management service for Cloud Foundry. It's primary role is as an OAuth2 provider, issuing tokens for client applications to use when they act on behalf of users. It can also authenticate users with their credentials, and can act as an SSO service using those credentials (or others). It has endpoints for managing user accounts and for registering OAuth2 clients, as well as various other management functions.

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

###Simple Usage

To register your application in UAA, specify in the configuration file:

 - `client_id`;
 - `client_secret`;
 - UAA URL (is obtained from the Cloud Foundry environment variable).

{{tip "To use this code on your local machine, you have to provide the direct UAA URL instead of URL from Cloud Foundry credentials." type="info"}}

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
Set the **isAllUrlsSecure** option as 'true' to make all your routes secure by default: 



```js
config.uaa.isAllUrlsSecure = true;
auth.use(config.uaa);
```

To provide more granular control of your routes security, you can add the **ensureAuthenticated** middleware for each route that needs to be secure. Refer to the *Detailed Information* section for more details.



##Detailed Information

###What Is UAA

UAA is a Cloud Foundry service that is responsible for securing the platform services and providing a single sign-on (SSO) for web applications. The primary role of the UAA component is to serve as an OAuth2 authorization server. 

The basic delegation model is described in the [OAuth2 specification][1]. You can also read more about the Cloud Foundry UAA component in [this article][2].

###How It Works

The library uses [passport][3] and [passport-OAuth][4] under the hood. It just provides the UAA authentication strategy that is inherited from the passport OAuth2 strategy and encapsulates the process of passport initialization from a developer. Also the library makes routes for login and logout and provides the **ensureAuthenticated** middleware that can check whether a user is authenticated or not.

To summarize, the auth object provides three functions and one object:

```js
var factory = require('factory');

// UAA strategy constructor function that could be used if you want to implement your own 
// authentication with passport and UAA strategy
var Strategy = factory.auth.Strategy;


// constructor function that instantiates the auth provider object
var Authentication = factory.auth.Authentication;

// middleware for checking user authentication
var ensureAuthenticated = factory.auth.ensureAuthenticated;

// socket authorization provider
var socketAuthorization = factory.auth.socketAuthorization;
```

###How to Add Authentication to Your Application

In summary, these steps are taken:

 - Create an instance of the *Authentication* constructor;
 - Execute the use method with UAA credentials;
 - Add the ***ensureAuthenticated*** middleware to the routes that need to be secure.



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

>**Note**: Since inside the **auth.use** method we initialize the passport's middleware and it works with sessions, we need to execute the **auth.use()** method after initialization of a session's middleware. Also it is important to use this function before router initialization; otherwise you could face passport errors. 




If routes are assigned in your application to a separate file, you do not need to instantiate the auth object for the middleware. You could just get it as a function.

```js
var ensureAuthenticated = require('factory').auth.ensureAuthenticated;

app.get('/', ensureAuthenticated, routes.index);

```

After having added authentication to your application, a user object can easily be accessed from each request object in the rout handler.



```js
app.get('/', ensureAuthenticated, function (request, response) {
    console.log(request.user);
});

```

###If All Routes Are Meant to Be Secure

If all routes are meant to be secure in your application, there is no need to add a middleware to each of them; you can just add the **isAllUrlsSecure** option and set it to `true`.



```js
config.uaa.isAllUrlsSecure = true;
auth.use(config.uaa);
```

After **ensureAuthenticated** has been initialized as a middleware for all the routes, it will redirect a user to the login page when this user has not been authenticated or the URL is not found in the list of unsecure URLs. By default, this list contains only three URLs: `/login`, `/auth/callback`, `/logout`, though you can extend this list using the **addUnsecureUrl** method.

```js
auth.addUnsecureUrl('/foobar');

//or just
auth.addUnsecureUrl(['/foo/bar', '/some/other/url']);

```

###How to Execute Your Code after Authentication

There are two ways to execute your code after successful authentication.

First, you can add your listener to the **successLoginevent** event: 



```js
auth.on('successLogin', function (profile) {
    console.log('this is profile of authenticated user %j', profile);
});

```
Or you can redefine the **verifyAuth** method before the **use** method has been executed.

```js
auth.verifyAuth = function (accessToken, refreshToken, profile, done) {
    // some your custom logic
    done(null, profile);
};

```

###How to Authorize a User on the WebSocket Connection

If you use [Socket.io][5] (or any module with the compatible API), you can run you handler when socket.io is performing a handshake (the *Authentication* module provides you with such a handler).

Take these steps:

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
The **checkAuthorization** method obtains `sessionStore`, `sessionKey` and `sessionSecret` and returns a checker function. 

Getting a session (if such session with the access token exists) for the session store by cookie (provided in the handshake object) does not return any errors.

Otherwise, you could get errors on client using this code:



```js
var sio = io.connect();

sio.socket.on('error', function (reason){
  console.error('Unable to connect Socket.IO', reason);
});

```

Also the *Authentication* module allows you to bind your custom handler on the `successSocketLogin` event. Add:

```js
socketAuth.on('successSocketLogin', function (user, handshake) {
    //your code
});
```

When using this event, you can add some information to the handshake object and then receive it on the connection event from the **socket.handshake** object.


[1]: http://tools.ietf.org/html/draft-ietf-oauth-v2
[2]: http://blog.cloudfoundry.com/2012/07/23/introducing-the-uaa-and-security-for-cloud-foundry/
[3]: http://passportjs.org/
[4]: https://github.com/jaredhanson/passport-oauth
[5]: http://socket.io/
