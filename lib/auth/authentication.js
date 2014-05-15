'use strict';

var passport = require('passport'),
    url = require('url'),
    util = require('util'),
    _ = require('lodash'),
    httpRequest = require('request'),
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
Authentication.prototype.verifyAuth = function (accessToken, refreshToken, params, profile, done) {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;
    profile.expires_in = Date.now() + Number(params.expires_in);

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


var getAccessTokenUsingRefreshTokenFlow = function (authOptions, user, callback) {
    var authorization = new Buffer(authOptions.clientID + ':' + authOptions.clientSecret).toString('base64');
    var options = {
        'url': authOptions.uaaUrl + '/oauth/token',
        'headers': {
            'Accept': 'application/json',
            'Authorization': 'Basic ' + authorization
        },
        'form': {
            'refresh_token': user.refreshToken,
            'grant_type': 'refresh_token'
        }
    };

    console.log('[getAccessTokenUsingRefreshTokenFlow] options', options);
    httpRequest.post(options, function (error, response, body) {
        console.log('[getAccessTokenUsingRefreshTokenFlow] response', error, response.statusCode, body);
        if (error || response.statusCode !== 200) {
            if (!error) {
                try {
                    body = JSON.parse(body);
                } catch (e) {}
            }

            return callback(error || body);
        }
        callback(null, body);
    });
};

var getExpirationDate = function(timeStamp) {
    var nowDateTimeStamp = new Date();

    return nowDateTimeStamp.getTime() + Number(timeStamp);
};

var checkExpires = function(expiresIn) {
    if (!expiresIn) {
        return true;
    }
    return new Date(expiresIn) < new Date();
};

Authentication.prototype.checkValidAndRefreshToken = function(request, response, next) {
    if (!request._passport.session.user || !checkExpires(request._passport.session.user.expires_in) ) {
        return next();
    }
    console.log('[getAccessTokenUsingRefreshTokenFlow]');
    getAccessTokenUsingRefreshTokenFlow(this.authOptions, request._passport.session.user, function(err, res){
        if (err) {
            return next(err);
        }
        res = JSON.parse(res);
        console.log('[TOKEN_REFRESHED]', res);
        request._passport.session.user.scope = res.scope;
        request._passport.session.user.accessToken = res.access_token;
        request._passport.session.user.expires_in = getExpirationDate(res.expires_in);
        next();
    });

};

Authentication.prototype.setAuthOptions = function(options) {
    this.authOptions = {
        callbackURL: options.callbackURL || '/auth/callback',
        clientID: options.clientId,
        clientSecret: options.clientSecret,
        uaaUrl: options.url
    };
}

/**
 * main function that should be called by app
 * it initialize passport and make login logout routes
 *
 * @param  {Object} options
 */
Authentication.prototype.use = function (options) {

    this.setAuthOptions(options);

    Strategy = this.Strategy || Strategy;

    this.app.use(checkSession);

    var strategy = new Strategy(_.clone(this.authOptions), this.verifyAuth.bind(this));

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

    this.app.use(this.checkValidAndRefreshToken.bind(this));
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
