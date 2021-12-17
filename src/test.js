const fs = require('fs');
const log = require('../dist/pilogger.js');

console.log(log.options);

log.header();
log.headerJson();

log.info('info');
log.state('state');
log.data('data', JSON.parse(fs.readFileSync('./package.json').toString()));
log.warn('warn');
log.error('error');
log.fatal('fatal');
log.timed(performance.now(), 'timed');

log.state('muted');
log.options.console = false;
log.data('data', JSON.parse(fs.readFileSync('./package.json').toString()));
log.options.console = true;
log.state('unmuted');

log.state('log file', 'test.log')
// log.logFile('test.log');
log.data('ring buffer', log.ring);

log.access('access');
log.client('client');

log.verbose('verbose');
log.debug('debug');

log.assert(1, 1, 'assert pass');
// @ts-ignore
log.assert(1, 0, 'assert failed');
