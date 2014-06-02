/*global describe, it: true*/

'use strict';

var sinon = require('sinon'),
    expect = require('chai').expect,
    rewire = require('rewire');

var serviceProxy = rewire('../../lib/serviceProxy/serviceProxy');

var httpProxyMock = {
    HttpProxy: sinon.stub()
};

var services = {
    search: {
        host: 'devportalsvc.devportal-ci.dspdev.wmg.com',
        api: '/api/v1',
        port: 80
    }
};

describe('serviceProxy', function () {
    it('#proxyRequest should proxy request on correct url', function () {
        serviceProxy.__set__('httpProxy', httpProxyMock);

        var proxyRequest = serviceProxy.__get__('proxyRequest');

        var proxy = {
            proxyRequest: sinon.spy()
        };

        httpProxyMock.HttpProxy.returns(proxy);

        serviceProxy.addProxiedServices(services);

        var request = {
            user: {
                accessToken: 'foobar'
            },
            params: {
                0: 'api/v1/foo/bar',
                name: 'search'
            },
            query: {
                foo: 'bar'
            },
            headers: {}
        };

        proxyRequest(request, {});
        expect(httpProxyMock.HttpProxy.called).to.eql(true);

        var httpProxyCall = httpProxyMock.HttpProxy.getCall(0);
        expect(httpProxyCall.args[0]).to.have.keys(['changeOrigin', 'target']);
        var target = httpProxyCall.args[0].target;
        var service = services[request.params.name];

        expect(target.host).to.eql(service.host);
        expect(target.port).to.eql(service.port);

        expect(proxy.proxyRequest.called).to.eql(true);
        var proxiedRequest = proxy.proxyRequest.getCall(0).args[0];

        expect(proxiedRequest.url).to.contain(service.api);
        expect(proxiedRequest.url).to.contain(request.params[0]);

        expect(proxiedRequest.headers.Authorization).to.contain(request.user.accessToken);

        //test request proxing with special chars
        proxy.proxyRequest = sinon.spy();

        var request = {
           user: {
               accessToken: 'foobar'
           },
           params: {
               //here we are using some special chars and don't encode them because in req.params express stores decoded version
               0: 'api/v1/foo/||',
               name: 'search'
           },
           query: {
               foo: 'bar'
           },
           headers: {}
       };

       proxyRequest(request, {});

       var proxiedRequest = proxy.proxyRequest.getCall(0).args[0];

       expect(proxiedRequest.url).to.eql('/api/v1/foo/%7C%7C?foo=bar');
    });
});