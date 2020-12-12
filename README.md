# PiLogger: Simple Logger for NodeJS

## Why

Because out of all of the existing modules, I couldn't find one that does what I needed and doesn't carry large number of unnecessary dependencies. There are far more complex loggers available, but sometimes all you need is simplicity with specific feature-set.  
This module is written in pure ES6 with minimal dependencies.

## Features

- Extremely lightweight
- Color coding of different log levels for console output
- Support for console and file logging
- Prefix messages with timestamp
- Maintening configurable ring buffer of past messages
- Automatic expansion of object parameters
- Automatic concating of multiple parameters
- All logging functions are asynchronous for non-blocking operations

## Configuration

Configuration is optional.  
If not configured, logging will be to console only and with default format  
Configuring inspect options controls how object output is handled  

```js
const log = require('pilogger');
const options = {
  options.dateFormat: 'YYYY-MM-DD HH:mm:ss',
  ringLength: 100,
  logFile: './application.log',
  accessFile: './accesss.log',
  clientFile: './client.log',
  inspect: {
    showHidden: true,
    depth: 5,
    colors: true,
    showProxy: true,
    maxArrayLength: 1024,
    maxStringLength: 10240,
    breakLength: 200,
    compact: 64,
    sorted: false,
    getters: true,
  }
}
log.configure(options);
```

## Usage

Messages that are printed to console only, useful for debugging

```js
  log.print(...msg);
```

Messages that are mirrored to console and `logFile` (if set), each one prefixed and color coded

```js
  log.blank(...msg);
  log.data(...msg);
  log.state(...msg);
  log.info(...msg);
  log.warn(...msg);
  log.error(...msg);
```

Example output (note that markdown rules strip colored output):

```json
  2020-08-08 10:36:55 INFO:  piscan version 0.0.1
  2020-08-08 10:36:55 INFO:  User: root Platform: linux Arch: x64 Node: v14.4.0
  2020-08-08 10:36:55 STATE: Running as root with full capabilities
  2020-08-08 10:37:08 DATA:  host: pi ip: 192.168.0.100 time: 12,210
  2020-08-08 10:37:10 DATA:  mac: DC:A6:32:1B:74:D5 vendor: Raspberry Pi os: Linux 5.4
  2020-08-08 10:37:12 DATA:  ports: 22,139,445,514,873
```

Messages that are mirrored to console and `logFile` (if set), each one prefixed and color coded and with time measurement

```js
  const t0 = process.hrtime.bigint();
  // do your stuff here
  log.timed(t0, ...msg);
```

Example output:

```json
  2020-08-08 10:39:59 TIMED:  1,004 ms Test function execution
```

Messages that are output to `accessFile` (if set) only  
Useful for detailed application access log that you don't want printed to console

```js
  log.access(...msg);
```

Messages that are output to `clientFile` (if set) only  
Useful for logging of any other messages that you don't want printed to console

```js
  log.client(...msg);
```

Access to history ring buffer.  
`obj.time` is message timestamp, `obj.tag` is message type (info, state, data, warn, error), `obj.msg` is parsed & concatened message string

```js
  for (const line in log.ring) {
    console.log(log.ring[line].time, log.ring[line].tag), log.ring[line].msg);
  }
```
