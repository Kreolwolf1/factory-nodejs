'use strict';

/**
 * Default cache client implementation
 * @constructor
 */
var VoidCacheClient = function () {};


VoidCacheClient.prototype.set = function (key, value, ttl, callback) {

    return callback(null);
};

VoidCacheClient.prototype.get = function (key, callback) {
    return callback(null, null);
};


VoidCacheClient.prototype.delete = function (key, isPattern, callback) {
    return callback(null);
};

module.exports = VoidCacheClient;