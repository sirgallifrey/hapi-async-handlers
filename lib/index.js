'use strict';

const Package = require('../package');
const Boom = require('boom');

const internals = {};

internals.asynHandler = function (route, fn) {

    return function (request, reply) {

        return Promise.resolve(fn.bind(this)(request, reply))
            .catch((err) => {

                reply(Boom.wrap(err));
            });
    };
};

exports.register = (server, options, next) => {

    server.handler('async', internals.asynHandler);

    next();
};

exports.register.attributes = {
    name: Package.name,
    version: Package.version
};
