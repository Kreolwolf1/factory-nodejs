'use strict';

var httpProxy = require('http-proxy'),
    _ = require('lodash'),
    util = require('util'),
    queryString = require('querystring'),
    passport = require('passport');

var proxiedServices = {};

/**
 * trying to get user from request object or
 * from session of from passport object
 *
 * @param  {IncomingMEssage} req
 * @return {Object}
 */
var getUser = function (req) {
    if (req.user) {
        return req.user;
    } else if (req.session.user) {
        return req.session.user;
    } else if (req.session[passport._key].user) {
        return req.session[passport._key].user;
    } else {
        return null;
    }
};

/**
 * proxy request to the service api by service name that taken from url
 *
 * @param  {IncomingMessage} request
 * @param  {OutgoingMessage} response
 */
var proxyRequest = function (request, response) {
    var serviceName = request.params.name;
    var apiUrl = request.params[0];

    var user = getUser(request);

    if (!user) {
        return response.json(401, {error: 'user is unauthorized'});
    }

    var proxy = proxiedServices[serviceName].proxy;

    var query = queryString.stringify(request.query);

    request.url = (query) ? util.format('/%s?%s', apiUrl, query) : '/' + apiUrl;

    request.headers.Authorization = 'Bearer ' + user.accessToken;

    proxy.proxyRequest(request, response);
};

var initServiceProxy = function initServiceProxy(service) {
    var defaultProxyConfig, overrideProxyConfig, proxyConfig;

    if (!service.host) {
        throw new Error('Service host is required');
    }

    service.host = service.host.replace(/(http:\/\/|https:\/\/|\/\/)/g, '');

    defaultProxyConfig = {
        changeOrigin: true,
        target: {
            host: service.host,
            port: service.port ? service.port : 80
        }
    };

    overrideProxyConfig = service.proxyConfig ? service.proxyConfig : {};

    proxyConfig = _.merge(defaultProxyConfig, overrideProxyConfig);

    service.proxy = new httpProxy.HttpProxy(proxyConfig);
    service.middlewares = [];
};

var initServices = function initServices(services) {
    var _services;
    if (!services || typeof services !== 'object') {
        throw new Error('Services are required');
    }
    _services = _.cloneDeep(services);
    _.forEach(_services, initServiceProxy);
    return _services;
};

var walkSubstack = function (stack, req, res, next) {

    if (typeof stack === 'function') {
        stack = [stack];
    }

    var walkStack = function (i, err) {

        if (err) {
            return next(err);
        }

        if (i >= stack.length) {
            return next();
        }

        stack[i](req, res, walkStack.bind(null, i + 1));

    };

    walkStack(0);

};

var applyMiddleware = function (req, res, next) {
    var serviceName = req.params.name;

    if (!proxiedServices[serviceName]) {
        return res.json(500, {error: 'there is no such service ' + serviceName});
    }

    var middlewares = proxiedServices[serviceName].middlewares;

    walkSubstack(middlewares, req, res, next);
};

exports.createProxy = function (app) {
    if (Object.keys(proxiedServices).length) {
        app.all('/services/:name/*', require('connect-restreamer')(), applyMiddleware, proxyRequest);
    }
};

exports.addProxiedServices = function (services) {
    proxiedServices = _.extend(proxiedServices, initServices(services));
};

exports.addMiddleware = function (serviceName, fn) {
    if (!proxiedServices[serviceName]) {
        throw new Error('there is no such service ' + serviceName);
    }

    proxiedServices[serviceName].middlewares.push(fn);
};
