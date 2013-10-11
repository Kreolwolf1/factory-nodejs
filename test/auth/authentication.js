/*global describe, it, beforeEach: true*/

'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;
var rewire = require('rewire');


var app;
var verify;
var uaaService;
var passport;

describe('auth', function () {
    var auth = require('../../factory').auth;
    it('should have Authentication constructor and Strategy', function () {
        expect(auth).to.have.property('Authentication');
        expect(auth).to.have.property('Strategy');

        expect(typeof auth.Authentication).to.eql('function');
        expect(typeof auth.Strategy).to.eql('function');
    });

    it('Authentication instanse should have use and ensureAuthenticated functions', function () {
        var authProvider = new auth.Authentication({}, {}, function () {});

        expect(authProvider).to.have.property('use');
        expect(typeof authProvider.use).to.eql('function');

        expect(authProvider).to.have.property('ensureAuthenticated');
        expect(typeof authProvider.ensureAuthenticated).to.eql('function');
    });


});
describe('authentication.Authentication', function () {
    var authentication = rewire('../../lib/auth/authentication');
    var auth;

    beforeEach(function () {
        app = {
            use: sinon.spy(),
            get: sinon.spy()
        };

        verify = sinon.spy();

        uaaService = {
            credentials: {
                login_server_url: 'some/server/url'
            }
        };

        passport = {
            use: sinon.spy(),
            serializeUser: sinon.spy(),
            deserializeUser: sinon.spy(),
            initialize: sinon.stub(),
            session: sinon.stub()
        };

        authentication.__set__('passport', passport);

        auth = new authentication.Authentication(app, uaaService, verify);
    });


    it('#use should create options and invoke passport methods', function () {
        var strategy = sinon.spy();
        auth.setStrategy(strategy);

        auth.makeRoutes = sinon.spy();

        var options = {};

        passport.initialize.returns('someInitValue');
        passport.session.returns('someSessionValue');

        auth.use(options);
        expect(options.callbackURL).to.eql('/auth/callback');
        expect(options.uaaUrl).to.eql(uaaService.credentials.login_server_url);
        expect(options.strategyName).to.eql('uaa');

        expect(strategy.called).to.eql(true);

        expect(passport.use.called).to.eql(true);
        expect(passport.serializeUser.called).to.eql(true);
        expect(passport.deserializeUser.called).to.eql(true);

        expect(passport.initialize.called).to.eql(true);
        expect(passport.session.called).to.eql(true);

        expect(auth.makeRoutes.called).to.eql(true);

        expect(app.use.getCall(0).args[0]).to.eql('someInitValue');
        expect(app.use.getCall(1).args[0]).to.eql('someSessionValue');
    });

    it('#ensureAuthenticated should call next if user is authenticated', function () {
        var requst = {
            isAuthenticated: sinon.stub()
        };

        requst.isAuthenticated.returns(true);
        var ensureAuthenticated = auth.ensureAuthenticated();

        ensureAuthenticated(requst, {}, function () {
            expect(requst.isAuthenticated.called).to.eql(true);
        });
    });

    it('#ensureAuthenticated should redirect on login page if user is new', function () {
        var requst = {
            isAuthenticated: sinon.stub()
        };

        requst.isAuthenticated.returns(false);
        var response = {
            redirect: sinon.spy(),
            send: sinon.spy()
        };
        var link = '/foo/bar';

        var createRedirectUrl = sinon.stub();
        createRedirectUrl.returns(link);

        authentication.__set__('createRedirectUrl', createRedirectUrl);

        var ensureAuthenticated = auth.ensureAuthenticated();
        ensureAuthenticated(requst, response, function () {});

        expect(response.redirect.called).to.eql(true);
        expect(response.send.called).to.eql(true);

        expect(response.redirect.getCall(0).args[0]).to.contain(encodeURIComponent(link));
        expect(response.send.getCall(0).args[0]).to.eql(401);
    });

    it('#makeRoutes should assigne routes for /login /logout and /auth/callback', function () {
        auth.makeRoutes({});

        expect(app.get.getCall(0).args[0]).to.eql('/login');
        expect(app.get.getCall(1).args[0]).to.eql('/logout');
        expect(app.get.getCall(2).args[0]).to.eql('/auth/callback');

    });

});