const bunyan = require('bunyan');
const bformat = require('bunyan-format');
const Bunyan2Loggly = require('bunyan-loggly');
const EventEmitter = require('events');
const _ = require('lodash');

const isProd = () => {
  const prodEnvs = ['production', 'prod'];
  return prodEnvs.includes(process.env.NODE_ENV);
};
const isDev = () => !isProd();
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
  /**
   *
   * @param {Object}  logglyConfig
   * @param {String}  logglyConfig.token
   * @param {String}  logglyConfig.subdomain
   * @param {Object}  [options]
   * @param {String}  [options.stdoutMode='long']
   */
  constructor(logglyConfig, options) {
    super();
    const defaultOpts = { stdoutMode: 'long' };
    this.options = _.defaultsDeep(options, defaultOpts);
    this.logglyConfig = logglyConfig;
    this.waiting = 0;
    this.bunyanFactory = this.bunyanFactory.bind(this);
    this.loggerFactory = this.loggerFactory.bind(this);
    this._getWaiting = this._getWaiting.bind(this);
  }

  /**
   * Creates a bunyan instance
   * @memberOf LogManager.prototype
   * @method bunyanFactory
   * @param {Object} [options={}]
   * @param {Function} [cb=noop]
   */
  bunyanFactory(options, cb) {
    cb = cb || noop;
    const defaultOpts = {};
    options = _.defaultsDeep(options, defaultOpts);

    const client = new Bunyan2Loggly(this.logglyConfig, null, null, () => {
      cb();
      this._decWaiting();
      if (this._getWaiting() === 0) {
        this.emit('done');
      }
    });

    // create the logger
    const bunyanConfig = {
      name: options.name,
      streams: [{ type: 'raw', stream: client }],
    };

    // if dev env print debug logs also
    if (isDev()) {
      bunyanConfig.level = 'debug';
    }

    // if dev and enable print logs to stdout
    if (isDev() && this.options.stdoutMode !== 'silent') {
      bunyanConfig.streams.push({ stream: bformat({ outputMode: this.options.stdoutMode }) });
    }

    return bunyan.createLogger(bunyanConfig);
  }

  /**
   * Creates a logger instance
   * @memberOf LogManager.prototype
   * @method loggerFactory
   * @param {Object} [options={}]
   * @param {Function} [cb=null]
   */
  loggerFactory(options, cb) {
    const defaultOpts = {};
    options = _.defaultsDeep(options, defaultOpts);

    const log = this.bunyanFactory(options, cb);
    log.onAllLogsReceived = (doneCb) => {
      if (this._getWaiting() === 0) {
        return doneCb();
      }
      this.on('done', doneCb);
    };
    log.getWaiting = this._getWaiting.bind(this);

    const levelsToProxy = ['info', 'warn', 'error', 'trace', 'fatal'];

    if (isDev()) {
      levelsToProxy.push('debug');
    }
    return _proxyMethods(log, levelsToProxy, () => this._incWaiting());
  }

  /**
   * Increment waiting log messages
   * @memberOf LogManager.prototype
   * @method _incWaiting
   * @private
   */
  _incWaiting() {
    this.waiting += 1;
  }

  /**
   * Decrement waiting log messages
   * @memberOf LogManager.prototype
   * @method _decWaiting
   * @private
   */
  _decWaiting() {
    this.waiting -= 1;
  }

  /**
   * Get waiting log messages
   * @memberOf LogManager.prototype
   * @method _getWaiting
   * @returns {number}
   * @private
   */
  _getWaiting() {
    return this.waiting;
  }
}

/**
 * Creates an instance of the LogManager class
 * @see LogManager
 * @param {Object}  logglyConfig
 * @param {String}  logglyConfig.token
 * @param {String}  logglyConfig.subdomain
 * @param {Object}  [options]
 * @param {Boolean} [options.logToStdoutInDev=true]
 */
function logManagerFactory(logglyConfig, options) { return new LogManager(logglyConfig, options); }

module.exports = logManagerFactory;
