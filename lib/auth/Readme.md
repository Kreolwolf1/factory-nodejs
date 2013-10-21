##What is it and Why I need this? 

Auth is the module that provide a simple way for developers to add UAA wmg authentication in to the node.js application.

***UAA*** (User Account and Authentication Service) is a Claud Foundry service that is responsible for securing the platform services and providing a single sign on (SSO) for web applications. The primary role of the UAA is as an OAuth2 Authorization Server. The basic delegation model is covered in the [OAuth2 specification](http://tools.ietf.org/html/draft-ietf-oauth-v2) also you can read more about Cloud Foundry UAA on this [article](http://blog.cloudfoundry.com/2012/07/23/introducing-the-uaa-and-security-for-cloud-foundry/)


##How it works?

The library uses [passport](http://passportjs.org/) and [passport-oauth](https://github.com/jaredhanson/passport-oauth) under the hood. So it just provides UAA authentication strategy that is inherited from passport OAuth2 strategy, and incapsulates from a developer the process of passport initialization. Also the library makes routes for login and logout and provides a middleware ***ensureAuthenticated*** that can check whether the user is authenticated or not.

In Summary the auth object provides three functions:

```js
var auth = require('factory').auth;

// UAA strategy constructor function that could be used if you want to implement your own 
// authentication with passport and UAA strategy
var Strategy = auth.Strategy;


// constructor function that instantiates the auth provider object
var Authentication = auth.Authentication;

// middleware for checking user authentication
var ensureAuthenticated = auth.ensureAuthenticated;

```

##What I supposed to do in order to add authentication into my app

You need to add a few line of code in your app.js file and use middleware with those routes that are supposed to be secure

```js
//app.js

var express = require('express');
var routes = require('./routes');

// some code...

var Authentication = require('factory').auth.Authentication;
var app = express();

// instantiate auth object using an Authentication constructor
var auth = new Authentication(app);

// some code... 

app.use(express.session());

// invoke use method with UAA credentials that initialize passport and makes '/login'
// and '/logout' routes 
auth.use({
    client_id: 'yourUaaClientID',
    client_secret: 'yourClientSecret',
    url: 'http://uaa.link.off.your.app'
});

app.use(app.router);


// some code

// add ensureAuthenticated middleware to the routes 
app.get('/', auth.ensureAuthenticated(), routes.index);

```

So what you need to do is to create an instanse of Authentication constructor, execute use method with uaa credentials and add ensureAuthenticated middleware to routes.

***Imprtant!!*** Since inside the auth.use method we initialize passport's middleware and it works with sessions we need to execute auth.use() method after initialization of session's middleware. Also it will be great to use this function before router initialization, in other case you could face with passport errors. 

If in your application routes are assigned in a separate file. You don't need to instantiate auth object just for middleware. You could just get it as a function

```js
var ensureAuthenticated = require('factory').auth.ensureAuthenticated;

app.get('/', ensureAuthenticated, routes.index);

```
