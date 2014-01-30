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

    var service = proxiedServices[serviceName];

    if(!service.proxy) {
        service.proxy = new httpProxy.HttpProxy({
            changeOrigin: true,
            target: {
                host: service.host,
                port: service.port
            }
        });
    }

    var proxy = service.proxy;

    var query = queryString.stringify(request.query);

    request.url = (query) ? util.format('/%s?%s', apiUrl, query) : '/' + apiUrl;

    request.headers.Authorization = 'Bearer ' + user.accessToken;

    proxy.proxyRequest(request, response);
};



exports.createProxy = function (app) {
    app.all('/services/:name/*', require('connect-restreamer')(), proxyRequest);
};

exports.addProxiedServices = function (services) {
    proxiedServices = _.extend(proxiedServices, services);
};
