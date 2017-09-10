# Yet Another Logger

## Installation

```
npm install --save yet-another-logger
```

## Usage

```javascript

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const chai = require('chai');
const LogManager = new require('yet-another-logger')( token: "secret-token", subdomain:"" });

const l = logManager.loggerFactory({ name: 'test/api/flights' });
const expect = chai.expect;

after(function(done) {
  this.timeout(20 * 1000);
  logManager.on('done', done);
  if (logManager.getWaiting() === 0) {
    return done();
  }
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

<a name="LogManager"></a>

## LogManager ⇐ <code>EventEmitter</code>
**Kind**: global class  
**Extends**: <code>EventEmitter</code>  
**See**

- https://www.loggly.com/docs/node-js-logs/
- https://github.com/trentm/node-bunyan


## Contributing

### Updating docs
Docs are generated from JSDocs via `npm run docs`
