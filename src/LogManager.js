const bunyan = require('bunyan');
const bformat = require('bunyan-format');
const Bunyan2Loggly = require('bunyan-loggly');
const EventEmitter = require('events');
const _ = require('lodash');

const isTest = () => process.env.NODE_ENV === 'test';
const noop = () => true;

/**
 *
 * @param {Object} obj
 * @param {Array} methods
 * @param {Function} proxy
 * @private
 * @returns {Object}
 */
function _proxyMethods(obj, methods, proxy) {
  const handler = {
    get(target, propKey) {
      const origMethod = target[propKey];
      if (!_.includes(methods, propKey)) {
        return origMethod;
      }

      return function (...args) {
        const result = origMethod.apply(this, args);
        proxy();
        return result;
      };
    },
  };

  return new Proxy(obj, handler);
}

/**
 * @class LogManager
 * @extends EventEmitter
 * @see https://www.loggly.com/docs/node-js-logs/
 * @see https://github.com/trentm/node-bunyan
 */
class LogManager extends EventEmitter {
  constructor(logglyConfig, options) {
    super();
    const defaultOpts = {};
    this.options = _.defaultsDeep(options, defaultOpts);
    this.logglyConfig = logglyConfig;
    this.waiting = 0;
  }

  /**
   * Creates a bunyan instance
   * @memberOf LogManager
   * @param {Object} [options={}]
   * @param {Function} [cb=noop]
   */
  bunyanFactory(options, cb) {
    cb = cb || noop;
    const defaultOpts = {};
    this.options = _.defaultsDeep(options, defaultOpts);

    const client = new Bunyan2Loggly(this.logglyConfig, null, null, () => {
      cb();
      this.decWaiting();
      if (this.getWaiting() === 0) {
        this.emit('done');
      }
    });

    // create the logger
    const bunyanConfig = {
      name: options.name,
      streams: [{ type: 'raw', stream: client }],
    };

    if (isTest()) {
      bunyanConfig.streams.push({ stream: bformat({ outputMode: 'long' }) });
    }

    return bunyan.createLogger(bunyanConfig);
  }

  /**
   * Creates a logger instance
   * @memberOf LogManager
   * @param {Object} [options={}]
   * @param {Function} [cb=null]
   */
  loggerFactory(options, cb) {
    const defaultOpts = {};
    options = _.defaultsDeep(options, defaultOpts);

    const log = this.bunyanFactory(options, cb);

    return _proxyMethods(log, ['info', 'warn', 'error', 'trace', 'fatal'], () => this.incWaiting());
  }

  incWaiting() {
    this.waiting += 1;
  }

  decWaiting() {
    this.waiting -= 1;
  }

  getWaiting() {
    return this.waiting;
  }
}

module.exports = LogManager;
