/*global describe, it, beforeEach: true*/
'use strict';

var expect = require('chai').expect;
var rewire = require('rewire');


var services = rewire('../../lib/services');

describe('#getService', function () {

    it('should return null if we isnt in the cloud', function () {
        services.__set__('cloudfoundry', {cloud: false});
        var service = services.getService('foo');

        expect(service).to.eql(null);
    });

    it('should return service if it exists and put it to cache', function () {
        services.__set__('cloudfoundry', {cloud: true});
        var VCAP_SERVICES = {
            'fooBar-v1_222': [{
                name: 'foo',
                plan: 'free'
            }]
        };
        process.env.VCAP_SERVICES = JSON.stringify(VCAP_SERVICES);

        var service = services.getService('fooBar');

        expect(service.name).to.eql('foo');

        var cachedService = services.__get__('serviceCache');

        expect(cachedService.foobar).to.eql({
            name: 'foo',
            plan: 'free'
        });
    });

    it('should return null if there is no such service', function () {
        services.__set__('cloudfoundry', {cloud: true});

        var service = services.getService('barFoo');

        expect(service).to.eql(null);

    });

});