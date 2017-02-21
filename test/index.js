const HapiAsyncHandlers = require('../lib');
const Boom = require('boom');
const Code = require('code');
const Hapi = require('hapi');
const Hoek = require('hoek');
const Lab = require('lab');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

//borrowed provisionServer from Inert with love <3
const provisionServer = (connection, debug) => {

    const server = new Hapi.Server({ debug });
    server.connection(connection);
    server.register(HapiAsyncHandlers, Hoek.ignore);
    return server;
};

function getSomething() {
    return new Promise((resolve, reject) => {

        setTimeout(() => {

            resolve('ok');
        }, 1);
    });
}

function getSomethingWithError() {
    return new Promise((resolve, reject) => {

        setTimeout(() => {

            reject(new Error('Sorry, bro'));
        }, 1);
    });
}

describe('hapi-async-handler', () => {

    it('register with no error', (done) => {

        const server = new Hapi.Server();
        server.connection();
        server.register(HapiAsyncHandlers, (err) => {

            expect(err).to.not.exist();
            done();
        });
    });

    it('Accepts a async handler', (done) => {

        const server = provisionServer();
        
        server.route({
            method: 'GET',
            path: '/',
            handler: {
                async: async function (request, reply) {

                    const something = await getSomething();

                    return reply(something);
                }
            }
        });

        server.inject('/', (res) => {

            expect(res.statusCode).to.equal(200);
            expect(res.payload).to.equal('ok');
            done();
        });
    });

    it('Deals with error on async handlers', (done) => {

        const server = provisionServer();

        server.route({
            method: 'GET',
            path: '/',
            handler: {
                async: async function (request, reply) {

                    const something = await getSomethingWithError();

                    return reply(something);
                }
            }
        });

        server.inject('/', (res) => {

            expect(res.statusCode).to.equal(500);
            done();
        });
    });

    it('preserves server.bind', (done) => {

        const server = provisionServer();

        server.bind({ potato: 'batata' });
        server.route({
            method: 'GET',
            path: '/',
            handler: {
                async: async function (request, reply) {

                    expect(this.potato).to.be.equal('batata');
                   const something = await getSomething();

                    return reply(something);
                }
            }
        });

        server.inject('/', (res) => {

            expect(res.statusCode).to.equal(200);
            expect(res.payload).to.equal('ok');
            done();
        });
    });
});