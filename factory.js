'use strict';

module.exports = {
    auth: require('./lib/auth/authentication'),
    authMock: require('./lib/authMock/authentication'),
    serviceProxy: require('./lib/serviceProxy'),
    services: require('./lib/services'),
    theme: require('./lib/theme')
};
