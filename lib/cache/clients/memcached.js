'use strict';

var _ = require('lodash');
var async = require('async');
var Memcached = require('memcached');

var DEFAULT_TTL = 5 * 60;
var DEFAULT_KEY_PREFIX = 'default:prefix';
var DEFAULT_KEY_SEPARATOR = ':';
var KEY_STORAGE_NAME = 'system:keys';
var DEFAULT_TIME_RECONNECT = 30 * 1000;
var DEFAULT_RECONNECTION = 5;
var DEFAULT_PING_TIME = 20 * 1000;

/**
 * @param {String|Array|Object} serverLocation
 * @param {Object} options
 * @constructor
 */
var MemcachedCacheClient = function (serverLocation, options) {
    this.client = new Memcached(serverLocation, options);
    options = options || {};
    this.keyPrefix = options.keyPrefix || DEFAULT_KEY_PREFIX;
    this.keySeparator = options.keySeparator || DEFAULT_KEY_SEPARATOR;
    this.timeReconnect = options.timeReconnect || DEFAULT_TIME_RECONNECT;
    this.reconnection = options.reconnection || DEFAULT_RECONNECTION;
    this.keyStorageName = this.keyPrefix + this.keySeparator + KEY_STORAGE_NAME;
    this.pingTime = options.pingTime || DEFAULT_PING_TIME;
    this.serverLocation = serverLocation;

    var that = this;
    this.connect(function (err) {
        if (!err) {
            that.client.emit('ready');
            that.ping();
        }
    });
};

/**
 * try to connect to memcached server
 * @param {Function} callback
 */
MemcachedCacheClient.prototype.connect = function (callback) {
    callback = callback || function () {};
    var that = this;
    this.client.connect(this.serverLocation, function (error, connection) {
        if (error || !connection) {
            if (connection) {
                that.client.connectionIssue(error, connection);
            } else {
                that.client.emit('issue', 'error while conecting');
            }
            return callback(error || 'error while conecting');
        }

        that.client.emit('connected', connection);
        callback(null, connection);
    });
};

/**
 * store key in key storage (storage has tree like structure),
 * items is a array of tokens that determine the pass
 * in witch this key should be stored
 *
 * @param {String} key
 * @param {Array} items
 * @param {Object} currentStorage
 * @return {*|{children: {}}}
 */
var setKeyStorage = function (key, items, currentStorage) {
    currentStorage = currentStorage || {children: {}};
    var first = items[0];
    if (items.length === 1) {
        currentStorage.children[first] = currentStorage.children[first] || {children: {}};
        currentStorage.children[first].value = key;
        return currentStorage;
    }

    currentStorage.children[first] = setKeyStorage(key, _.rest(items), currentStorage.children[first]);
    return currentStorage;
};

/**
 * get all keys from the storage or storage part
 *
 * @param {Object} keyStorage
 * @return {Array}
 */
var getKeysFromStorage = function (keyStorage) {
    var result = [];
    if (keyStorage.value) {
        result.push(keyStorage.value);
    }
    if (!_.keys(keyStorage.children).length) {
        return result;
    }

    var children = _.map(keyStorage.children, getKeysFromStorage);
    return result.concat(_.flatten(children));

};

/**
 * find keys in tree like keyStorage by path in patternItems
 * @param {Array} patternItems
 * @param {Object} keysStorage
 * @return {*}
 */
var findKeyInStorage = function (patternItems, keysStorage) {
    if (keysStorage === undefined) {
        return null;
    }

    var first = patternItems[0];
    if (patternItems.length === 1) {
        if (first === '*') {
            return getKeysFromStorage(keysStorage);
        }
        var item = keysStorage.children[first];

        return (item && item.value) ? item.value : null;
    }

    return findKeyInStorage(_.rest(patternItems), keysStorage.children[first]);
};


/**
 * delete key in try like storage by path
 * @param patternItems
 * @param keyStorage
 * @return {null}
 */
var deleteKeyInStorage = function (patternItems, keyStorage) {
    if (_.last(patternItems) === '*') {
        patternItems.pop();
    }

    var first = patternItems[0];

    if (!keyStorage.children[first]) {
        return null;
    }

    if (patternItems.length === 1) {
        delete keyStorage.children[first];
        return null;
    }
    deleteKeyInStorage(_.rest(patternItems), keyStorage.children[first]);
};

/**
 * create key using prefix and separator
 * @param {String} key
 * @return {String}
 * @private
 */
MemcachedCacheClient.prototype._buildKey = function (key) {
    return this.keyPrefix + this.keySeparator + key;
};

/**
 * Add key to key storage
 *
 * @param {String} key
 * @param {Function} callback
 * @private
 */
MemcachedCacheClient.prototype._addToKeyStorage = function (key, callback) {
    var that = this;
    async.waterfall([
        this.client.get.bind(this.client, this.keyStorageName),
        function (keyStorage, next) {
            var itemsList = key.split(that.keySeparator);
            keyStorage = setKeyStorage(key, itemsList, keyStorage);
            that.client.set(that.keyStorageName, keyStorage, 30 * 60, next);
        }
    ], callback);
};

/**
 * save key  in cache
 * @param {String} key
 * @param {*} value
 * @param {Number} ttl
 * @param {Function} callback
 */
MemcachedCacheClient.prototype.set = function (key, value, ttl, callback) {
    var that = this;
    if (_.isFunction(ttl)) {
        callback = ttl;
        ttl = DEFAULT_TTL;
    }

    callback = callback || function () {};
    if (!_.isString(value)) {
        value = JSON.stringify(value);
    }
    async.series([
        function (next) {
            that.client.set(that._buildKey(key), value, ttl, next);
        },
        function (next) {
            that._addToKeyStorage(key, next);
        }
    ], function (err) {
        callback(err);
    });
};

/**
 * get key from storage
 * @param {String} key
 * @param {Function} callback
 */
MemcachedCacheClient.prototype.get = function (key, callback) {
    this.client.get(this._buildKey(key), function (err, result) {
        if (err) {
            return callback(err);
        }
        if (!result) {
            return callback(null, null);
        }

        if (_.isString(result)) {
            try {
                result = JSON.parse(result);
            } catch (e) {}
        }
        callback(null, result);
    });
};

/**
 * delete keys using pattern or just one key by name
 * @param {String} key
 * @param {Boolean} isPattern
 * @param {Function} callback
 */
MemcachedCacheClient.prototype.delete = function (key, isPattern, callback) {
    if (_.isFunction(isPattern)) {
        callback = isPattern;
        isPattern = false;
    }

    callback = callback || function () {};
    var that = this;
    var keyStorage;
    var pattern = key.split(this.keySeparator);

    async.waterfall([
        this.client.get.bind(this.client, this.keyStorageName),
        function (result, next) {
            keyStorage = result;

            if (!isPattern) {
                return that.client.del(that._buildKey(key), next);
            }

            var keys = findKeyInStorage(pattern, keyStorage);
            if (!keys) {
                return next(null);
            }

            keys = (!_.isArray(keys)) ? [keys] : keys;

            async.each(keys, function (key, cb) {
                that.client.del(that._buildKey(key), cb);
            }, next);
        },
        function (res, next) {
            if (_.isFunction(res)) {
                next = res;
            }
            deleteKeyInStorage(pattern, keyStorage);
            that.client.set(that.keyStorageName, keyStorage, 30 * 60, next);
        }
    ], function (err) {
        callback(err);
    });
};

/**
 * reconnect to server after failure
 * @param {Function} callback
 */
MemcachedCacheClient.prototype.reconnect = function (callback) {
    var that = this;
    callback = callback || function () {};

    async.retry(this.reconnection, function (cb) {
        setTimeout(function () {
            that.connect(cb);
        }, that.timeReconnect);
    }, function (err) {
        if (!err) {
            that.ping();
        }
    });
};

/**
 * ping server in order to check is it alive or not
 */
MemcachedCacheClient.prototype.ping = function () {
    var that = this;

    this.client.set(this._buildKey('ping'), 'pong', 10, function (err) {
        that.client.emit('ping', err);
        if (!err) {
            setTimeout(function () {
                that.ping();
            }, that.pingTime);
        }
    });
};

/**
 * setup degradation after failure
 *
 * @param {Function} onConnect
 * @param {Function} onError
 */
MemcachedCacheClient.prototype.setupDegradation = function (onConnect, onError) {
    var that = this;
    var isErrorHappened = false;

    var errorHandler = function (err) {
        if (!isErrorHappened) {
            isErrorHappened = true;
            onError(err);
            that.client.once('connected', function () {
                isErrorHappened = false;
                onConnect();
            });
            that.reconnect();
        }
    };

    this.client.on('issue', errorHandler);
};

module.exports = MemcachedCacheClient;