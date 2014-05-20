/*global describe, it, beforeEach, before: true*/
'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var async = require('async');
var rewire = require('rewire');

var MemcachedCacheClient = rewire('../../../lib/cache/clients/memcached');

describe('MemcachedCacheClient', function () {
    var setKeyStorage = MemcachedCacheClient.__get__('setKeyStorage');
    var findKeyInStorage = MemcachedCacheClient.__get__('findKeyInStorage');
    var deleteKeyInStorage = MemcachedCacheClient.__get__('deleteKeyInStorage');

    describe('#setKeyStorage', function () {

        it('should build key storage', function () {
            var result = {children: {}};
            result = setKeyStorage('a:b:c', ['a', 'b','c'], result);
            expect(result.children.a.children).to.have.property('b');
            expect(result.children.a.children.b.children).to.have.property('c');
            expect(result.children.a.children.b.children.c.value).to.eql('a:b:c');

            result = setKeyStorage('a:b', ['a', 'b'], result);
            expect(result.children.a.children).to.have.property('b');
            expect(result.children.a.children.b.value).to.eql('a:b');
            expect(result.children.a.children.b.children).to.have.property('c');
            expect(result.children.a.children.b.children.c.value).to.eql('a:b:c');

            result = setKeyStorage('d:e:r', ['d', 'e', 'r'], result);
            expect(result.children.d.children.e.children.r.value).to.eql('d:e:r');

        });
    });

    describe('#findKeyInStorage', function () {
        var storage;
        before(function () {
            storage = setKeyStorage('a:b:c', ['a', 'b', 'c'], storage);
            storage = setKeyStorage('a:b:d', ['a', 'b', 'd'], storage);
        });

        it('should find keys in storage by pattern', function () {
            var result = findKeyInStorage(['a','b','*'], storage);
            expect(result).to.be.an('array');
            expect(result).to.contain('a:b:c', 'a:b:d');

            var a = findKeyInStorage(['a', '*'], storage);
            expect(a).to.be.an('array');

        });

        it('should find key in storage', function () {
            var result = findKeyInStorage(['a','b','c'], storage);
            expect(result).to.be.a('string');
            expect(result).to.eql('a:b:c');
        });

        it('should return null if there is no such key in storage', function () {
            var result = findKeyInStorage(['a', 'c'], storage);
            expect(result).to.eql(null);

            var wrongResult = findKeyInStorage(['a','d','c','*'], storage);
            expect(wrongResult).to.eql(null);
        });

        it('should return null if the key does not contain value and there is no star in pattern', function () {
            var wrongResult = findKeyInStorage(['a','b'], storage);
            expect(wrongResult).to.eql(null);
        });
    });

    describe('#deleteKeyInStorage', function () {
        var storage;
        beforeEach(function () {
            storage = setKeyStorage('a:b:c', ['a', 'b', 'c'], storage);
            storage = setKeyStorage('a:b:d', ['a', 'b', 'd'], storage);
        });

        it('should delete key in storage by pattern', function () {
            deleteKeyInStorage(['a','b', '*'], storage);
            expect(storage).to.be.an('object');
            expect(storage.children.a.children).to.not.have.property('b');
        });

        it('should delete some key by name', function () {
            deleteKeyInStorage(['a', 'b', 'c'], storage);
            expect(storage).to.be.an('object');
            var c = findKeyInStorage(['a', 'b', 'c'], storage);
            expect(c).to.eql(null);
        });

        it('should not delete any key if the pattern is wrong', function () {
            deleteKeyInStorage(['a', 'd', 'c'], storage);
            expect(storage).to.be.an('object');
            var b = findKeyInStorage(['a', 'b', '*'], storage);
            expect(b).to.contain('a:b:c', 'a:b:d');

            var d = findKeyInStorage(['a', 'b', 'd'], storage);
            expect(d).to.eql('a:b:d');
        });
    });

});

describe.skip('integration Memcached degradation', function () {
    var options = {
        retry: 3000,
        reconnect: 3000
    };
    it('should emit error after connection to crashed server', function (done) {
        var client = new MemcachedCacheClient('127.0.0.1:11211', options);

        var onConnect = function () {
            done();
        };

        var onError = function (err) {
            console.log('errr', err);
        };

        client.setupDegradation(onConnect, onError);

        client.client.on('connected', function (err) {
            console.log('connected', err);
        });
    });
});

describe.skip('integration MemcachedCacheClient', function () {
    var client;
    before(function () {
        client = new MemcachedCacheClient(['127.0.0.1:11211'], {retry: 3000});
    });

    it('should set some key to memcache', function (done) {
        async.waterfall([
            client.set.bind(client, 'foo', 'bar'),
            function (next) {
                client.get('foo', next);
            },
            function (result, next) {
                expect(result).to.eql('bar');
                next();
            }
        ], function (err) {
            if (err) {
                done(err);
            }
            client.delete('foo', function (err) {
                setTimeout(done, 3000);
            });
        });
    });


    it('should set two keys and than delete them by pattern', function (done) {
        async.waterfall([
            client.set.bind(client, 'foo:bar', 'bar'),
            function (next) {
                client.set('foo:qaz', 'qaz', next);
            },
            function (next) {
                client.delete('foo:*', true, next);
            },
            function (next) {
                client.get('foo:qaz', next);
            }
        ], function (err, res) {
            expect(err).to.eql(null);
            expect(res).to.eql(null);
            done();
        });
    });
});

