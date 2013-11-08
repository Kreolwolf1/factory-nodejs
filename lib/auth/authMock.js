'use strict';

var request = require('request'),
    url = require('url'),
    _ = require('lodash'),
    async = require('async');

var state = 'FJHRY3';
var redirectUri = 'http://app1.vmykhailiuk.dev';


/**
 * AuthMock constructor
 * @constructor
 * 
 * @class {AuthMock}
 * @param {Object}
 */
var AuthMock = function (options) {
    this.host = options.uaaUrl;
    this.clientID = options.clientID;
    this.clientSecret = options.clientSecret;
    this.credentials = options.credentials;

    if (!this.credentials || !this.credentials.username || !this.credentials.password) {
        throw new Error('bad credentials in AuthMock');
    }
};


/**
 * make request on lofin endpoint and get coocie JSESSIONID from headers
 * @param  {Function} callback
 */
AuthMock.prototype.getSessionCookie = function (callback) {
    var loginUrl = this.host + '/login.do';
    request.post({
        url: loginUrl,
        qs: this.credentials,
        headers: {
            Accept: 'application/json'
        },
        followRedirect: false
    }, function (err, res) {
        if (err) {
            return callback(err);
        }
        var cookies = res.req.res.headers['set-cookie'];
        var cookie = cookies[0];
        console.log('[cookie]', cookie);
        callback(null, cookie);
    });
};


/**
 * make request on /oauth/authorize endpoint end pass to
 * the callback authorithation code from header field Location
 * 
 * @param  {String}   cookie
 * @param  {Function} callback
 */
AuthMock.prototype.getAuthCode = function (cookie, callback) {
    var getCodeUrl = this.host + '/oauth/authorize';
    var query = {
        client_id: this.clientID,
        redirect_uri: redirectUri,
        response_type: 'code',
        state: state
    };

    request.post({
        url: getCodeUrl,
        qs: query,
        headers: {
            Accept: 'application/json',
            Cookie: cookie
        },
        followRedirect: false
    }, function (err, res) {
        if (err) {
            return callback(err);
        }
        var location = res.req.res.headers.location;
        var parsed = url.parse(location, true);

        if (!parsed.query.code) {
            return callback('There is no auth code in response');
        }

        callback(null, parsed.query.code);
    });
};

/**
 * return information about token form /oauth/token endpoint
 * 
 * @param  {String}   authCode
 * @param  {Function} callback
 */
AuthMock.prototype.getTokens = function (authCode, callback) {
    
    var tokenUrl = this.host + '/oauth/token';
    request.post({
        url: tokenUrl,
        auth: {
            username: this.clientID,
            password: this.clientSecret,
        },
        qs: {
            grant_type: 'authorization_code',
            code: authCode,
            redirect_uri: redirectUri
        },
        headers: {
            Accept: 'application/json',
        }

    }, function (err, res, body) {
        if (err) {
            return callback(err);
        }
        callback(null, JSON.parse(body));
    });
};

/**
 * get information about user by authToken
 * @param  {Function} callback
 */
AuthMock.prototype.getUserInfo = function (accessToken, callback) {
    var userInfoUrl = this.host + '/userinfo';
    request.get({
        url: userInfoUrl,
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    }, function (err, res, body) {
        if (err) {
            return callback(err);
        }
        callback(null, JSON.parse(body));
    });
};

/**
 * get user object for authentication
 * @param  {Function} callback
 */
AuthMock.prototype.getUser = function (callback) {
    var that = this;
    var userInfo = {
        email: this.credentials.username
    };

    async.waterfall([
        function (next) {
            that.getSessionCookie(next);
        },
        function (cookie, next) {
            that.getAuthCode(cookie, next);
        },
        function (code, next) {
            that.getTokens(code, next);
        },
        function (tokens, next) {
            userInfo.accessToken = tokens.access_token;
            userInfo.refreshToken = tokens.refresh_token;

            that.getUserInfo(userInfo.accessToken, next);
        }
    ], function (err, res) {
        if (err) {
            console.log('[Error]', err);
            return callback(err);
        }
        userInfo = _.extend(userInfo, res);
        callback(null, userInfo);
    });
};

/**
 * authenticate user
 * @param  {IncomingMessage}   req
 */
AuthMock.prototype.authenticate = function (req, callback) {
    this.getUser(function (err, user) {
        if (err) {
            return callback(err);
        }

        req._passport.session.user = user;
        req.user = user;
        callback();
    });
};


module.exports = AuthMock;
