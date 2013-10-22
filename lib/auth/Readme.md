#Authentification Library: What It Is and Why We Need It 

Auth is a module that provides a simple way for developers to add the User Account and Authentication (UAA) wmg authentication to the ***node.js*** application.

UAA is a Cloud Foundry service that is responsible for securing the platform services and providing a single sign-on (SSO) for web applications. The primary role of the UAA component is to serve as an OAuth2 authorization server. 

The basic delegation model is described in the [OAuth2 specification](http://tools.ietf.org/html/draft-ietf-oauth-v2). You can also read more about the Cloud Foundry UAA component in [this article](http://blog.cloudfoundry.com/2012/07/23/introducing-the-uaa-and-security-for-cloud-foundry/).

##How It Works?

The library uses [passport](http://passportjs.org/) and [passport-OAuth](https://github.com/jaredhanson/passport-oauth) under the hood. It just provides the UAA authentication strategy that is inherited from the passport OAuth2 strategy and encapsulates the process of passport initialization from a developer. Also the library makes routes for login and logout and provides the ***ensureAuthenticated*** middleware  that can check whether a user is authenticated or not.

To summarize, the auth object provides three functions:

```
js

// UAA strategy constructor function that could be used if you want to implement your own 
// authentication with passport and UAA strategy
var Strategy = require('factory').auth.Strategy;


// constructor function that instantiates the auth provider object
var Authentication = require('factory').auth.Authentication;

// middleware for checking user authentication
var ensureAuthenticated = require('factory').auth.ensureAuthenticated;
```

##How to Add Authentication into Your Application

You need to add a few lines of code into your ***app.js*** file and use the middleware with those routes that are supposed to be secure:

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
So what you need to do is to create an instanse of the *Authentication* constructor, execute the use method with UAA credentials, and add the ***ensureAuthenticated*** middleware to the routes.

>**Imprtant** Since inside the ***auth.use*** method we initialize the passport's middleware and it works with sessions, we need to execute the ***auth.use()*** method after initialization of a session's middleware. Also it will be great to use this function before router initialization, otherwise you could face passport errors. 

If routes are assigned in your application to a separate file, you do not need to instantiate the auth object for a middleware. You could just get it as a function.

```js
var ensureAuthenticated = require('factory').auth.ensureAuthenticated;

app.get('/', ensureAuthenticated, routes.index);

```

If all routes are supposed to be secure in your application, there is no need to add a middleware to each of them; you can just add and set the ***isAllUrlsSecure*** option to "true".

```js
auth.use({
    client_id: 'yourUaaClientID',
    client_secret: 'yourClientSecret',
    url: 'http://uaa.link.off.your.app',
    isAllUrlsSecure: true
});

```

After ***ensureAuthenticated*** has been initialized as a middleware for all the routes, it will redirect a user to the login page when this user has not been authenticated or the URL is not found in the list of unsecure URLs. By default this list contains only three URLs: '/login', '/auth/callback', '/logout', but you can extend this list using the ***addUnsecureUrl*** method.

```js
auth.addUnsecureUrl('/foobar');

//or just
auth.addUnsecureUrl(['/foo/bar', '/some/other/url']);

```
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

