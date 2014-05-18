'use strict';

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;

var client = null;
var failOverClient = null;
var failedClient = null;

var failOverMode = false;

var DEFAULT_TTL = 5 * 60;

var cacheClients = {};

var cache = Object.create(new EventEmitter());


module.exports = _.assign(cache, {
    /**
     * Registers a cache client
     * @param {String} name
     * @param {Object} buildCacheClient
     */
    registerCacheClient: function (name, buildCacheClient) {
        cacheClients[name] = buildCacheClient;
    },

    /**
     * Setups fallback for the cache
     */
    setupDegradation: function () {
        var that = this;
        if (client.client && _.isFunction(client.client.on)) {

            var onConnect = function () {
                that.emit('clientReconnect');
                client = failedClient;
                failedClient = null;
                failOverMode = false;
            };

            var onError = function (err) {

                if (failOverMode) {
                    return;
                }

                that.emit('clientError', err);
                failedClient = client;
                client = failOverClient;
                failOverMode = true;

                failedClient.client.once('connect', onConnect);
            };

            client.client.on('error', onError);
        }
    },

    /**
     * Sets a default client from the list of registered cache clients
     * @param {String} type
     */
    setClient: function (type) {
        if (cacheClients[type] === undefined || !_.isFunction(cacheClients[type])) {
            return null;
        }

        client = cacheClients[type]();

        if (client.client && _.isFunction(client.client.on)) {
            this.setupDegradation();
        }
    },

    /**
     * Sets fallback cache client
     * @param {String} type
     */
    setFailOverClient: function (type) {
        if (cacheClients[type] === undefined || !_.isFunction(cacheClients[type])) {
            return null;
        }

        failOverClient = cacheClients[type]();
    },

    /**
     * Sets a value to the cache;
     * @param {String} key
     * @param {*} value
     * @param {Number} ttl
     * @param {Function} callback
     */
    set: function (key, value, ttl, callback) {
        if (_.isFunction(ttl)) {
            callback = ttl;
            ttl = DEFAULT_TTL;
        }

        ttl = _.isUndefined(ttl) ? DEFAULT_TTL : ttl;
        callback = callback || function () {};

        client.set(key, value, ttl, callback);
    },

    get: function (key, callback) {
        client.get(key, callback);
    },

    /**
     * Deletes a key from the cache
     * @param {String} key
     * @param {Boolean} isPattern - If true, all keys that matched key pattern will be deleted
     */
    delete: function (key, isPattern, callback) {
        if (!_.isFunction(callback)) {
            callback = function(){};
            isPattern = _.isBoolean(isPattern) ? isPattern : false;
        }

        client.delete(key, isPattern, callback);
    },


    /**
     * Wraps a function with cache
     * @param {String} key
     * @param {Function} action
     * @returns {Function}
     */
    wrapWithCache: function (key, action) {
        var client = this;
        return function () {
            var that = this;
            var _arguments = _.toArray(arguments);
            var _key = key;

            //remove standart callback from arguments
            var done = _arguments.pop();

            //process cache key func
            if (_.isFunction(_key)) {
                _key = _key.apply(this, arguments);
            }

            client.get(_key, function (err, result) {
                if (err) {
                    return done(err);
                }

                if (result) {
                    return done(null, result);
                }

                //create new custom callback with default cache setter
                var callback = function (err, result) {
                    //if there isn't error set new value to cache
                    if (!err) {
                        client.set(_key, result);
                    }

                    //invoke default callback
                    done.apply(this, arguments);
                };

                //insert out custom callback instead of default callback
                _arguments.push(callback);

                //if there isn't values in cache - invoke action
                action.apply(that, _arguments);
            });
        };
    }
});

