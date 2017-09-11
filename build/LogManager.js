'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bunyan = require('bunyan');
var bformat = require('bunyan-format');
var Bunyan2Loggly = require('bunyan-loggly');
var EventEmitter = require('events');
var _ = require('lodash');

var isProd = function isProd() {
  var prodEnvs = ['production', 'prod'];
  return prodEnvs.includes(process.env.NODE_ENV);
};
var isDev = function isDev() {
  return !isProd();
};
var noop = function noop() {
  return true;
};

/**
 *
 * @param {Object} obj
 * @param {Array} methods
 * @param {Function} proxy
 * @private
 * @returns {Object}
 */
function _proxyMethods(obj, methods, proxy) {
  var handler = {
    get: function get(target, propKey) {
      var origMethod = target[propKey];
      if (!_.includes(methods, propKey)) {
        return origMethod;
      }

      return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var result = origMethod.apply(this, args);
        proxy();
        return result;
      };
    }
  };

  return new Proxy(obj, handler);
}

/**
 * @class LogManager
 * @extends EventEmitter
 * @see https://www.loggly.com/docs/node-js-logs/
 * @see https://github.com/trentm/node-bunyan
 */

var LogManager = function (_EventEmitter) {
  (0, _inherits3.default)(LogManager, _EventEmitter);

  /**
   *
   * @param {Object}  logglyConfig
   * @param {String}  logglyConfig.token
   * @param {String}  logglyConfig.subdomain
   * @param {Object}  [options]
   * @param {String}  [options.stdoutMode='long']
   */
  function LogManager(logglyConfig, options) {
    (0, _classCallCheck3.default)(this, LogManager);

    var _this = (0, _possibleConstructorReturn3.default)(this, (LogManager.__proto__ || (0, _getPrototypeOf2.default)(LogManager)).call(this));

    var defaultOpts = { stdoutMode: 'long' };
    _this.options = _.defaultsDeep(options, defaultOpts);
    _this.logglyConfig = logglyConfig;
    _this.waiting = 0;
    _this.bunyanFactory = _this.bunyanFactory.bind(_this);
    _this.loggerFactory = _this.loggerFactory.bind(_this);
    _this.getWaiting = _this.getWaiting.bind(_this);
    return _this;
  }

  /**
   * Creates a bunyan instance
   * @memberOf LogManager
   * @param {Object} [options={}]
   * @param {Function} [cb=noop]
   */


  (0, _createClass3.default)(LogManager, [{
    key: 'bunyanFactory',
    value: function bunyanFactory(options, cb) {
      var _this2 = this;

      cb = cb || noop;
      var defaultOpts = {};
      options = _.defaultsDeep(options, defaultOpts);

      var client = new Bunyan2Loggly(this.logglyConfig, null, null, function () {
        cb();
        _this2._decWaiting();
        if (_this2.getWaiting() === 0) {
          _this2.emit('done');
        }
      });

      // create the logger
      var bunyanConfig = {
        name: options.name,
        streams: [{ type: 'raw', stream: client }]
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
     * @memberOf LogManager
     * @param {Object} [options={}]
     * @param {Function} [cb=null]
     */

  }, {
    key: 'loggerFactory',
    value: function loggerFactory(options, cb) {
      var _this3 = this;

      var defaultOpts = {};
      options = _.defaultsDeep(options, defaultOpts);

      var log = this.bunyanFactory(options, cb);
      log.allDone = function (doneCb) {
        return _this3.on('done', doneCb);
      };

      var levelsToProxy = ['info', 'warn', 'error', 'trace', 'fatal'];

      if (isDev()) {
        levelsToProxy.push('debug');
      }
      return _proxyMethods(log, levelsToProxy, function () {
        return _this3._incWaiting();
      });
    }

    /**
     * @private
     */

  }, {
    key: '_incWaiting',
    value: function _incWaiting() {
      this.waiting += 1;
    }

    /**
     * @private
     */

  }, {
    key: '_decWaiting',
    value: function _decWaiting() {
      this.waiting -= 1;
    }
  }, {
    key: 'getWaiting',
    value: function getWaiting() {
      return this.waiting;
    }
  }]);
  return LogManager;
}(EventEmitter);

/**
 *
 * @param {Object}  logglyConfig
 * @param {String}  logglyConfig.token
 * @param {String}  logglyConfig.subdomain
 * @param {Object}  [options]
 * @param {Boolean} [options.logToStdoutInDev=true]
 */


function logManagerFactory(logglyConfig, options) {
  return new LogManager(logglyConfig, options);
}

module.exports = logManagerFactory;