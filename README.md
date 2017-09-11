# Yet Another Logger

## Installation

```
npm install --save yet-another-logger
```

## Usage

Central logger file, lets call `logger.js`

```javascript
const logger = require('yet-another-logger')({ token: 'blablabla', subdomain: 'bla' });
module.exports = logger.loggerFactory;
```

Some other file
```javascript

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const chai = require('chai');

const l = require('./logger.js')({ name: 'test/api/flights' });
const expect = chai.expect;

after(function(done) {
  this.timeout(20 * 1000);
  l.onAllLogsReceived(done);
});

describe('foo', function() {
  this.timeout(10 * 1000);
  describe('foo.search', function() {
    it('should work', async function() {
      let res;
      try { res = foo.search() } catch(e) { log.error(e); }
      l.info('foo.search', res);
    });
  });
});
```
## Documentation

## Classes

<dl>
<dt><a href="#LogManager">LogManager</a> ⇐ <code>EventEmitter</code></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#logManagerFactory">logManagerFactory(logglyConfig, [options])</a></dt>
<dd></dd>
</dl>

<a name="LogManager"></a>

## LogManager ⇐ <code>EventEmitter</code>
**Kind**: global class  
**Extends**: <code>EventEmitter</code>  
**See**

- https://www.loggly.com/docs/node-js-logs/
- https://github.com/trentm/node-bunyan

<a name="logManagerFactory"></a>

## logManagerFactory(logglyConfig, [options])
**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| logglyConfig | <code>Object</code> |  | 
| logglyConfig.token | <code>String</code> |  | 
| logglyConfig.subdomain | <code>String</code> |  | 
| [options] | <code>Object</code> |  | 
| [options.logToStdoutInDev] | <code>Boolean</code> | <code>true</code> | 


## Contributing

### Updating docs
Docs are generated from JSDocs via `npm run docs`
