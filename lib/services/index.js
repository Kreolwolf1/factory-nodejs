'use strict';
var cloudfoundry = require('cloudfoundry');
var _ = require('lodash');
var serviceCache = {};

/**
 * returns cloudfoundry service by service name or even by part of it
 * 
 * @param  {String} serviceName
 * @return {Object}
 */
exports.getService = function (serviceName) {
    if (!cloudfoundry.cloud) {
        return null;
    }

    serviceName = serviceName.toLowerCase();

    if (serviceCache[serviceName]) {
        return serviceCache[serviceName];
    }

    var services = JSON.parse(process.env.VCAP_SERVICES);
    var service = _.first(_.find(services, function (service, name) {
        return name.toLowerCase().indexOf(serviceName) >= 0;
    }));

    if (service) {
        serviceCache[serviceName] = service;
    }

    return service || null;
};