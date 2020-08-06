# PiLogger

Simple Logger for NodeJS

## Features

- Extremely lightweight
- Color coding of different log levels
- Support for console and file logging
- Prefix messages with timestamp
- Maintening configurable ring buffer of past messages
- Automatic expansion of object parameters
- Automatic concating of multiple parameters
- All logging functions are asynchronous for non-blocking operations

## Configuration

Configuration is optional.  
If not configured, logging will be to console only and with default format  

    const log = require('pilogger');
    const options = {
      options.dateFormat: 'YYYY-MM-DD HH:mm:ss',
      ringLength: 100,
      logFile: './application.log',
      accessFile: './accesss.log',
      clientFile: './client.log',
    }
    log.configure(options);

## Usage

Messages that are printed to console only, useful for debugging

    log.print(...msg);

Messages that are mirrored to console and 'logFile'

    log.blank(...msg);
    log.data(...msg);
    log.state(...msg);
    log.info(...msg);
    log.warn(...msg);
    log.error(...msg);

Messages that are output to 'accessFile' (if set) only  
Useful for detailed application access log that you don't want printed to console

    log.access(...msg);

Messages that are output to 'clientFile' (if set) only  
Useful for logging of any other messages that you don't want printed to console

    log.client(...msg);

Access to history ring buffer.  
obj.time is message timestamp, obj.tag is message type (info, state, data, warn, error), obj.msg is parsed message string

    for (const line in log.ring) {
      console.log(log.ring[line].time, log.ring[line].tag), log.ring[line].msg);
    }
