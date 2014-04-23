'use strict';

module.exports = {
    auth: require('./lib/auth/authentication'),
    authMock: require('./lib/authMock/authentication'),
    passwordAuthMock: require('./lib/passwordAuthMock/authentication'),
    serviceProxy: require('./lib/serviceProxy/serviceProxy'),
    services: require('./lib/services/services'),
    validation: require('./lib/validation/validation')
};
