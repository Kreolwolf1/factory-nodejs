/*global describe, it, beforeEach: true*/

'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;
var rewire = require('rewire');


var app;
var verify;
var passport;

describe('auth', function () {
    var auth = require('../../factory').auth;
    it('should have Authentication, Strategy constructors and ensureAuthenticated', function () {
        expect(auth).to.have.property('Authentication');
        expect(auth).to.have.property('Strategy');
        expect(auth).to.have.property('ensureAuthenticated');

        expect(auth.Authentication).to.be.a('Function');
        expect(auth.Strategy).to.be.a('Function');
    });

    it('Authentication instanse should have use and ensureAuthenticated functions', function () {
        var authProvider = new auth.Authentication({}, {}, function () {});

        expect(authProvider).to.have.property('use');
        expect(authProvider.use).to.be.a('Function');

        expect(authProvider).to.have.property('ensureAuthenticated');
        expect(authProvider.ensureAuthenticated).to.be.a('Function');
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

        passport = {
            use: sinon.spy(),
            serializeUser: sinon.spy(),
            deserializeUser: sinon.spy(),
            initialize: sinon.stub(),
            session: sinon.stub()
        };

        authentication.__set__('passport', passport);

        auth = new authentication.Authentication(app, verify);
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
            isAuthenticated: sinon.stub(),
            method: 'GET'
        };

        requst.isAuthenticated.returns(false);
        var response = {
            redirect: sinon.spy()
        };
        var link = '/foo/bar';

        var createRedirectUrl = sinon.stub();
        createRedirectUrl.returns(link);

        authentication.__set__('createRedirectUrl', createRedirectUrl);

        var ensureAuthenticated = auth.ensureAuthenticated();
        ensureAuthenticated(requst, response, function () {});

        expect(response.redirect.called).to.eql(true);
        expect(response.redirect.getCall(0).args[0]).to.contain(encodeURIComponent(link));
    });

    it('#ensureAuthenticated should returns 401 error if req.method is not GET', function () {
        var requst = {
            isAuthenticated: sinon.stub()
        };
        requst.isAuthenticated.returns(false);
        var response = {
            send: sinon.spy()
        };

        var ensureAuthenticated = auth.ensureAuthenticated();
        ensureAuthenticated(requst, response, function () {});

        expect(response.send.called).to.eql(true);
        expect(response.send.getCall(0).args[0]).to.eql(401);
    });

    it('#makeRoutes should assigne routes for /login /logout and /auth/callback', function () {
        auth.makeRoutes({});

        expect(app.get.getCall(0).args[0]).to.eql('/login');
        expect(app.get.getCall(1).args[0]).to.eql('/logout');
        expect(app.get.getCall(2).args[0]).to.eql('/auth/callback');

    });

    it('#verifyAuth should fill profile and emit event', function (done) {
        var accessToken = 'someAccessToken';
        var refreshToken = 'someRefreshToken';

        auth.on('successLogin', function (profile) {
            expect(profile.accessToken).to.eql(accessToken);
            expect(profile.refreshToken).to.eql(refreshToken);
            done();
        });

        auth.verifyAuth(accessToken, refreshToken, {}, function () {});
    });

});