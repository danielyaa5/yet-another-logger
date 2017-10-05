# Yet Another Logger

## Installation

```
npm install --save yet-another-logger
```

## Usage

Central logger file, lets call `logger.js`


```javascript
const logManager = require('yet-another-logger');

const logglyConfig = {
  token: 'secret-token',
  subdomain: 'subdomain name'
};

global.l = logManager(logglyConfig).loggerFactory({ name: 'app' });
```
Some other file


```javascript

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const chai = require('chai');

const expect = chai.expect;

after(function(done) {
  this.timeout(20 * 1000);
  console.log(l.getWaiting()) // prints number of logs waiting for confirmation from loggly
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
<dd><p>Creates an instance of the LogManager class</p>
</dd>
</dl>

<a name="LogManager"></a>

## LogManager ⇐ <code>EventEmitter</code>
**Kind**: global class  
**Extends**: <code>EventEmitter</code>  
**See**

- https://www.loggly.com/docs/node-js-logs/
- https://github.com/trentm/node-bunyan


* [LogManager](#LogManager) ⇐ <code>EventEmitter</code>
    * [.bunyanFactory([options], [cb])](#LogManager+bunyanFactory)
    * [.loggerFactory([options], [cb])](#LogManager+loggerFactory)

<a name="LogManager+bunyanFactory"></a>

### logManager.bunyanFactory([options], [cb])
Creates a bunyan instance

**Kind**: instance method of [<code>LogManager</code>](#LogManager)  

| Param | Type | Default |
| --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | 
| [cb] | <code>function</code> | <code>noop</code> | 

<a name="LogManager+loggerFactory"></a>

### logManager.loggerFactory([options], [cb])
Creates a logger instance

**Kind**: instance method of [<code>LogManager</code>](#LogManager)  

| Param | Type | Default |
| --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | 
| [cb] | <code>function</code> | <code></code> | 

<a name="logManagerFactory"></a>

## logManagerFactory(logglyConfig, [options])
Creates an instance of the LogManager class

**Kind**: global function  
**See**: LogManager  

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
