'use strict';

module.exports = {
    auth: require('./lib/auth/authentication'),
    authMock: require('./lib/authMock/authentication'),
    passwordAuthMock: require('./lib/passwordAuthMock/authentication'),
    serviceProxy: require('./lib/serviceProxy/serviceProxy'),
    services: require('./lib/services/services'),
    validation: require('./lib/validation/validation'),
    cache: require('./lib/cache/cache'),
    cacheClients: {
        Redis: require('./lib/cache/clients/redis'),
        Void: require('./lib/cache/clients/void'),
        Memcached: require('./lib/cache/clients/memcached')
    }
};
