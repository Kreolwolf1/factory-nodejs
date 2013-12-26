'use strict';

var passport = require('passport'),
    url = require('url'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;

var Strategy = require('./passport-uaa/strategy'),
    unsecureUrl = require('./unsecureUrl');


exports.socketAuthorization = require('./socketAuthorization');
exports.Strategy = Strategy;

var getProtocol = function (request) {
    var isHttps = (request.connection.encrypted || request.headers['x-forwarded-proto'] === 'https');
    return isHttps ? 'https' : 'http';
};

var createUrl = function (request, path) {
    path = path || '';
    var headers = request.headers;

    return getProtocol(request) + '://' + headers.host + path;
};

/**
 * create url for redirect after login
 * @param  {Object} request
 * @return {String}
 */
var createRedirectUrl = function (request) {
    var parsed = url.parse(request.url);
    if (parsed.protocol) {
        return request.url;
    }

    return createUrl(request, request.url);
};


/**
 * create an instanse of authentication provider
 * 
 * @param {Object} app
 * @constructor
 */
var Authentication = function (app) {
    this.app = app;
    this.authOptions = {};
};

util.inherits(Authentication, EventEmitter);

exports.Authentication = Authentication;

Authentication.STRATEGY_NAME = 'uaa';

/**
 * default authentication verify function
 * @param  {String}   accessToken
 * @param  {String}   refreshToken
 * @param  {Object}   profile
 * @param  {Function} done
 */
Authentication.prototype.verifyAuth = function (accessToken, refreshToken, profile, done) {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;

    this.emit('successLogin', profile);
    done(null, profile);
};


/**
 * add unsecure url to url list
 * @param {String|Array} urls
 */
Authentication.prototype.addUnsecureUrl = function (urls) {
    unsecureUrl.add(urls);
};

/**
 * make routes for login logoutand auth/callback
 */
Authentication.prototype.makeRoutes = function () {
    var options = this.authOptions;

    var makeCallbackUrl = function (request) {
        var redirectUri = encodeURIComponent(request.query.redirect_uri || '/');
        return util.format('%s?redirect_uri=%s', options.callbackURL, redirectUri);
    };

    this.app.get('/login', function (request, response, next) {
        return passport.authenticate(Authentication.STRATEGY_NAME, {
            callbackURL: makeCallbackUrl(request)
        })(request, response, next);
    });

    this.app.get('/logout', function (request, response) {
        request['user'] = null;

        delete request._passport.session.user;
        var redirectUrl = encodeURIComponent(request.header('Referer') || createUrl(request));
        var redirectUri = util.format('%s/logout.do?redirect=%s', options.uaaUrl, redirectUrl);

        response.redirect(redirectUri);
    });

    this.app.get('/auth/callback', function (request, response, next) {
        return passport.authenticate(Authentication.STRATEGY_NAME, {
            callbackURL: makeCallbackUrl(request),
            successRedirect: request.query.redirect_uri,
            failureRedirect: '/'
        })(request, response, next);
    });
};

Authentication.prototype.setStrategy = function (Strategy) {
    this.Strategy = Strategy;
};

var checkSession = function (request, response, next) {
    if (!request.session) {
        return next('You have to add session middleware before auth!');
    }
    next();
};

/**
 * main function that should be called by app
 * it initialize passport and make login logout routes
 * 
 * @param  {Object} options
 */
Authentication.prototype.use = function (options) {

    this.authOptions = {
        callbackURL: options.callbackURL || '/auth/callback',
        clientID: options.clientId,
        clientSecret: options.clientSecret,
        uaaUrl: options.url
    };

    Strategy = this.Strategy || Strategy;

    this.app.use(checkSession);

    var strategy = new Strategy(this.authOptions, this.verifyAuth.bind(this));

    passport.use(strategy);

    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    this.app.use(passport.initialize());
    this.app.use(passport.session());

    if (options.isAllUrlsSecure) {
        this.app.use(this.ensureAuthenticated());
    }
};



/**
 * check if user authenticated or not
 * 
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 */
var ensureAuthenticated = function (req, res, next) {
    var parsedUrl = url.parse(req.url);
    if (req.isAuthenticated() || unsecureUrl.check(parsedUrl.pathname)) {
        return next();
    }

    if (req.method !== 'GET' || req.xhr) {
        return res.send(401);
    }

    var redirectUri = encodeURIComponent(createRedirectUrl(req));
    return res.redirect(util.format('/login?redirect_uri=%s', redirectUri));
};

exports.ensureAuthenticated = ensureAuthenticated;

/**
 * return function that check if the authenticated or not
 * could be used as middleware
 * 
 * @return {Function}
 */
Authentication.prototype.ensureAuthenticated = function () {
    return ensureAuthenticated;
};
