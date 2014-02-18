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

    if (!proxiedServices[serviceName]) {
        return response.json(500, {error: 'there is no such service ' + serviceName});
    }

    var proxy = proxiedServices[serviceName].proxy;

    var query = queryString.stringify(request.query);

    request.url = (query) ? util.format('/%s?%s', apiUrl, query) : '/' + apiUrl;

    request.headers.Authorization = 'Bearer ' + user.accessToken;

    proxy.proxyRequest(request, response);
};

var initServiceProxy = function initServiceProxy (service) {
    var defaultProxyConfig, overrideProxyConfig, proxyConfig;

    if(!service.host){
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

};

var initServices  = function initServices (services) {
    var _services;
    if(!services || typeof services !== 'object'){
        throw new Error('Services are required');
    }
    _services = _.cloneDeep(services);
    _.forEach(_services, initServiceProxy);
    return _services;
};

exports.createProxy = function (app) {
    if(Object.keys(proxiedServices).length){
        app.all('/services/:name/*', require('connect-restreamer')(), proxyRequest);
    }
};

exports.addProxiedServices = function (services) {
    proxiedServices = _.extend(proxiedServices, initServices(services));
};
