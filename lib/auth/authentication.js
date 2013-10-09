'use strict';

var passport = require('passport'),
  url = require('url'),
  util = require('util');

var Strategy = require('./passport-uaa/strategy');

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
 * create an instanse of authentication provider
 * 
 * @param {Object} app
 * @param {Object} uaaService
 * @param {Function} verify
 * @constructor
 */
var Authentication = function (app, uaaService, verify) {
  this.app = app;
  this.uaaService = uaaService;
  this.verify = verify;
};

exports.Authentication = Authentication;

Authentication.STRATEGY_NAME = 'uaa';

/**
 * create url for redirect after login
 * @param  {Object} request
 * @return {String}
 */
Authentication.prototype.createRedirectUrl = function (request) {
  var parsed = url.parse(request.url);
  if (parsed.protocol) {
    return request.url;
  }

  return createUrl(request, request.url);
};

/**
 * make routes for login logoutand auth/callback
 */
Authentication.prototype.makeRoutes = function (options) {
  var makeCallbackUrl = function (request) {
    var redirectUri = encodeURIComponent(request.query.redirect_uri);
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


/**
 * main function that should be called by app
 * 
 * @param  {Object} options
 */
Authentication.prototype.use = function (options) {
  options = options || {};
  options.callbackURL = options.callbackURL || '/auth/callback';
  options.strategyName = options.strategyName || Authentication.STRATEGY_NAME;
  var strategy;

  if (this.uaaService &&
      this.uaaService.credentials &&
      this.uaaService.credentials.login_server_url) {
    options.uaaUrl = this.uaaService.credentials.login_server_url;

  }
  if (this.Strategy) {
    strategy = new this.Strategy(options, this.verify);
  } else {
    strategy = new Strategy(options, this.verify);
  }
  passport.use(strategy);

  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  this.app.use(passport.initialize());
  this.app.use(passport.session());

  this.makeRoutes(options);
};

Authentication.prototype.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  var redirectUri = encodeURIComponent(this.createRedirectUrl(req));
  res.redirect(util.format("/login?redirect_uri=%s", redirectUri));
  return res.send(401);
};
