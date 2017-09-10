'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');
var path = require('path');
var moment = require('moment');
var request = require('request-promise');
var _ = require('lodash');
var mkdirp = require('mkdirp');

/**
 * @callback queryCb
 * @param {Error | undefined}   error                 - query error, undefined if success
 * @param {Object | undefined} [response]             - query response object, undefined if error
 */
/**
 * Instantiates the object for interacting with Google QPX API
 * @class Api
 * @param {String} apikey                       - QPX api key
 * @param {Object} [options = {}]               - Optional parameters
 * @param {String} [options.backup = false]     - Absolute path for location to save full query response and request in JSON
 *                                                Backup filename = MM-DD-YY__origin__destination__current-date.json
 * @param {Boolean} [options.simple=true]       - If true, throws on invalid status codes
 * request in JSON
 */
function Api(apikey, options) {
  var defaultOptions = { backup: false, simple: true };
  this.options = _.defaultsDeep(options, defaultOptions);
  if (!apikey || typeof apikey !== 'string' || apikey.length === 0) {
    throw Error('Api class expects a valid apikey');
  }
  this.apikey = apikey;
  this.url = 'https://www.googleapis.com/qpxExpress/v1/trips/search?key=' + this.apikey;
}

// instance methods
/**
 * Perform a Google QPX query
 * @see https://developers.google.com/qpx-express/v1/trips/search#request
 * @memberOf Api
 * @param {Object} q                          - Query object
 * @param {String} q.maxPrice                 - The max price for the trip. Note - Must be prefixed with currency i.e. EUR.
 * @param {String} q.origin                   - The origin airport code.
 * @param {String} q.destination              - The destination airport code.
 * @param {String|Number} q.date              - The date of the flight... moment will attempt to parse the date to YYYY-MM-DD
 *                                                e.g. '2016-12-14' or ms timestamp will work
 * @param {Number} [q.solutions=500]          - The number of possible routes the API should return.
 * @param {Number} [q.adultCount=1]           - The number of adults going on the trip.
 * @param {Number} [q.childCount=0]           - The number of children going on the trip.
 * @param {Number} [q.infantInLapCount=0]     - The number of passengers that are infants travelling in the lap of an adult.
 * @param {Number} [q.infantInSeatCount=0]    - The number of passengers that are infants each assigned a seat.
 * @param {Number} [q.seniorCount=0]          - The number of passengers that are senior citizens.
 * @param {Number} [q.maxStops=∞]             - The maximum number of stops the passenger(s)
 *                                                are willing to accept in this slice.
 * @param {Number} [q.maxConnectionDuration=∞]- The longest connection between two legs, in minutes.
 * @param {String} [q.earliestTime=00:00]     - The earliest time of day in HH:MM format for departure.
 * @param {String} [q.latestTime=23:59]       - The latest time of day in HH:MM format for departure.
 * @param {String} [q.refundable=Either]      - Return only solutions with refundable fares.
 * @param {String} [q.preferredCabin=Any]     - Allowed values are COACH, PREMIUM_COACH, BUSINESS, and FIRST.
 * @param {Array}  [q.permittedCarrier=Any]   - A list of 2-letter IATA airline designators to filter your results.
 * @param {Array}  [q.prohibitedCarrier=None] - A list of 2-letter IATA airline designators. Exclude results that match.
 * @param {String} [q.alliance=Any]           - Slices with only the carriers in this alliance should be returned;
 *                                                do not use this field with permittedCarrier.
 *                                                Allowed values are ONEWORLD, SKYTEAM, and STAR.
 * @param {String} [q.saleCountry]            - IATA country code representing the point of sale.
 *                                                This determines the "equivalent amount paid" currency for the ticket.
 * @param {String} [q.ticketingCountry]       - IATA country code representing the point of ticketing.
 * @param {queryCb} [cb]                      - If you want to use callbacks instead of promises
 * @returns {Promise | undefined}             - Resolves to response object or undefined if using callback
 *                                                @see https://developers.google.com/qpx-express/v1/trips/search#response
 */
Api.prototype.query = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(q, cb) {
    var defaultQ, queryBody, queryRequest, queryResponse;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if (!cb) {
              _context.next = 7;
              break;
            }

            _context.t0 = cb;
            _context.next = 5;
            return this.query(q);

          case 5:
            _context.t1 = _context.sent;
            return _context.abrupt('return', (0, _context.t0)(null, _context.t1));

          case 7:
            defaultQ = {
              adultCount: 1,
              solutions: 500
            };
            queryBody = Api._getQueryBody(_.defaultsDeep(q, defaultQ));
            queryRequest = { method: 'POST', url: this.url, body: queryBody, json: true, simple: this.options.simple };
            _context.next = 12;
            return Api._queryPromise(queryRequest);

          case 12:
            queryResponse = _context.sent;


            if (this.options.backup) {
              Api._saveQueryData(this.options.backup, q, queryRequest, queryResponse);
            }

            if (!_.isError(queryResponse)) {
              _context.next = 16;
              break;
            }

            throw queryResponse;

          case 16:
            return _context.abrupt('return', queryResponse);

          case 19:
            _context.prev = 19;
            _context.t2 = _context['catch'](0);

            if (!cb) {
              _context.next = 23;
              break;
            }

            return _context.abrupt('return', cb(_context.t2));

          case 23:
            throw _context.t2;

          case 24:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 19]]);
  }));

  function query(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return query;
}();

/**
 * Perform a Google QPX query, no processing will be done on the query or response so it must follow the api format
 * @see https://developers.google.com/qpx-express/v1/trips/search#request
 * @see https://developers.google.com/qpx-express/v1/trips/search#response
 * @memberOf Api
 * @param    {Object}   q                      - Query object
 * @param    {queryCb} [cb]                    - If you want to use callbacks instead of promises
 * @returns  {Promise | undefined}             - Resolves to response object or undefined if using callback
 */
Api.prototype.rawQuery = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(q, cb) {
    var queryRequest, queryResponse;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!cb) {
              _context2.next = 12;
              break;
            }

            _context2.prev = 1;
            _context2.t0 = cb;
            _context2.next = 5;
            return this.query(q);

          case 5:
            _context2.t1 = _context2.sent;
            return _context2.abrupt('return', (0, _context2.t0)(null, _context2.t1));

          case 9:
            _context2.prev = 9;
            _context2.t2 = _context2['catch'](1);
            return _context2.abrupt('return', cb(_context2.t2));

          case 12:
            queryRequest = { method: 'POST', url: this.url, body: q, json: true, simple: this.options.simple };
            _context2.next = 15;
            return Api._queryPromise(queryRequest);

          case 15:
            queryResponse = _context2.sent;


            if (this.options.backup) {
              Api._saveQueryData(this.options.backup, q, queryRequest, queryResponse);
            }

            return _context2.abrupt('return', queryResponse);

          case 18:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[1, 9]]);
  }));

  function query(_x3, _x4) {
    return _ref2.apply(this, arguments);
  }

  return query;
}();

// static methods
/**
 * Save request and response data to json file for backup purposes
 * @param {String} savePath     - Path to save file
 * @param {Object} q            - Original query argument
 * @param {Object} req          - Query request
 * @param {Object} res          - Query response
 * @static
 * @memberOf Api
 * @private
 */
Api._saveQueryData = function (savePath, q, req, res) {
  // Create sub directories if they don't exist
  mkdirp.sync(savePath);
  // Save backup req and response as timestamp.json
  var qDate = moment(q.date).format('MM-DD-YY');
  var currDate = moment().format('MM-DD-YY_h:mm:ssa');
  var f = qDate + '__' + q.origin + '__' + q.destination + '__' + currDate + '.json';
  var writePath = path.resolve(savePath, f);
  fs.writeFileSync(writePath, (0, _stringify2.default)({ query: q, request: req, response: res }, null, 2), 'utf8');
};

/**
 * Returns a promise which resolves to the response body
 * @param {Object} queryRequest          - The request object made to the QPX api
 * @returns {Promise} Promise with query response body
 * @throws Will throw an error if request-promise fails
 * @static
 * @memberOf Api
 * @private
 */
Api._queryPromise = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(queryRequest) {
    var response;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return request(queryRequest);

          case 3:
            response = _context3.sent;
            return _context3.abrupt('return', response);

          case 7:
            _context3.prev = 7;
            _context3.t0 = _context3['catch'](0);
            return _context3.abrupt('return', _context3.t0);

          case 10:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 7]]);
  }));

  return function (_x5) {
    return _ref3.apply(this, arguments);
  };
}();

/**
 * Constructs the body for the QPX query
 * Refer to Api.query for details about params
 * @see Api.query
 * @param {Object} q
 * @param {String} q.origin
 * @param {String} q.destination
 * @param {String} q.date
 * @param {String} q.maxPrice
 * @param {Number} q.solutions
 * @param {Number} [q.adultCount]
 * @param {Number} [q.childCount]
 * @param {Number} [q.infantInLapCount]
 * @param {Number} [q.infantInSeatCount]
 * @param {Number} [q.seniorCount]
 * @param {Number} [q.maxStops]
 * @param {Number} [q.maxConnectionDuration]
 * @param {String} [q.preferredCabin]
 * @param {String} [q.earliestTime]
 * @param {String} [q.latestTime]
 * @param {Array}  [q.permittedCarrier]
 * @param {Array}  [q.prohibitedCarrier]
 * @param {String} [q.alliance]
 * @param {String} [q.saleCountry]
 * @static
 * @memberOf Api
 * @private
 */
Api._getQueryBody = function (_ref4) {
  var adultCount = _ref4.adultCount,
      childCount = _ref4.childCount,
      infantInLapCount = _ref4.infantInLapCount,
      infantInSeatCount = _ref4.infantInSeatCount,
      seniorCount = _ref4.seniorCount,
      origin = _ref4.origin,
      destination = _ref4.destination,
      date = _ref4.date,
      maxStops = _ref4.maxStops,
      maxConnectionDuration = _ref4.maxConnectionDuration,
      preferredCabin = _ref4.preferredCabin,
      permittedCarrier = _ref4.permittedCarrier,
      prohibitedCarrier = _ref4.prohibitedCarrier,
      alliance = _ref4.alliance,
      earliestTime = _ref4.earliestTime,
      latestTime = _ref4.latestTime,
      maxPrice = _ref4.maxPrice,
      solutions = _ref4.solutions,
      saleCountry = _ref4.saleCountry;

  date = moment(date).format('YYYY-MM-DD');
  return {
    request: {
      passengers: {
        kind: 'qpxexpress#passengerCounts',
        adultCount: adultCount,
        childCount: childCount,
        infantInLapCount: infantInLapCount,
        infantInSeatCount: infantInSeatCount,
        seniorCount: seniorCount
      },
      maxPrice: maxPrice,
      solutions: solutions,
      slice: [{
        kind: 'qpxexpress#sliceInput',
        origin: origin,
        destination: destination,
        date: date,
        maxStops: maxStops,
        preferredCabin: preferredCabin,
        maxConnectionDuration: maxConnectionDuration,
        permittedCarrier: permittedCarrier,
        prohibitedCarrier: prohibitedCarrier,
        alliance: alliance,
        permittedDepartureTime: {
          kind: 'qpxexpress#timeOfDayRange',
          earliestTime: earliestTime,
          latestTime: latestTime
        }
      }],
      saleCountry: saleCountry
    }
  };
};

module.exports = Api;