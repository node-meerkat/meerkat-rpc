'use strict';
const EventEmitter = require('events').EventEmitter;

class Dispatcher extends EventEmitter {
    constructor(services) {
        super();
        this.on('reload', services => self.services = services);
        this.services = services;
    }
}

module.exports = Dispatcher;
const pro      = Dispatcher.prototype;

/**
 * route the msg to appropriate service object
 *
 * @param msg msg package {service:serviceString, method:methodString, args:[]}
 * @param services services object collection, such as {service1: serviceObj1, service2: serviceObj2}
 * @param cb(...) callback function that should be invoked as soon as the rpc finished
 */
pro.route = function (tracer, msg, cb) {
    tracer && tracer.info('server', __filename, 'route', 'route messsage to appropriate service object');
    let namespace = this.services[msg.namespace];
    if (!namespace) {
        tracer && tracer.error('server', __filename, 'route', 'no such namespace:' + msg.namespace);
        cb(new Error('no such namespace:' + msg.namespace));
        return;
    }

    let service = namespace[msg.service];
    if (!service) {
        tracer && tracer.error('server', __filename, 'route', 'no such service:' + msg.service);
        cb(new Error('no such service:' + msg.service));
        return;
    }

    let method = service[msg.method];
    if (!method) {
        tracer && tracer.error('server', __filename, 'route', 'no such method:' + msg.method);
        cb(new Error('no such method:' + msg.method));
        return;
    }

    let args = msg.args;
    args.push(cb);
    method.apply(service, args);
};