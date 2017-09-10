# Google Flights Api

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

## Classes

<dl>
<dt><a href="#LogManager">LogManager</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#proxyMethods">proxyMethods(obj, methods, proxy)</a> ⇒ <code>Object</code></dt>
<dd></dd>
</dl>

<a name="LogManager"></a>

## LogManager
**Kind**: global class  
<a name="proxyMethods"></a>

## proxyMethods(obj, methods, proxy) ⇒ <code>Object</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| obj | <code>Object</code> | 
| methods | <code>Array</code> | 
| proxy | <code>function</code> | 


## Contributing

### Updating docs
Docs are generated from JSDocs via `npm run docs`
