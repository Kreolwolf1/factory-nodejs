/*global describe, it, beforeEach, before, afterEach: true*/
'use strict';

var sinon = require('sinon');
var rewire = require('rewire');

var cache = rewire('../../lib/cache/cache');

describe('cache', function () {
    var cacheClient = {
        set: function () {},
        get: function () {},
        delete: function () {}
    };

    var cacheClientMock;

    var key = 'foo';
    var value = 'bar';
    var callback = function () {};

    before(function () {
        cacheClientMock = sinon.mock(cacheClient);
        cache.registerCacheClient('test', function () {
            return cacheClient;
        });

        cache.setClient('test');
    });
    describe('#get', function () {
        it('should call client method get with params', function () {

            cacheClientMock.expects('get')
                .once()
                .withArgs(key, callback);

            cache.get(key, callback);
            cacheClientMock.verify();
        });
    });

    describe('#set', function () {
        var expectation;

        before(function () {
            expectation = cacheClientMock.expects('set');
        });

        it('should call client set with default ttl if it is missing', function () {
            expectation.once()
                .withArgs(key, value, cache.__get__('DEFAULT_TTL'), callback);

            cache.set(key, value, callback);
            cacheClientMock.verify();
        });

        it('should call client with ttl and with default callback', function () {
            expectation.once()
                .withArgs(key, value, 15, function () {});

            cache.set(key, value, 15);
            cacheClientMock.verify();
        });
    });
});