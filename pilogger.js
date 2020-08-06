const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const moment = require('moment');

const ring = [];
let dateFormat = 'YYYY-MM-DD HH:mm:ss';
let ringLength = 100;
const tags = [];
tags.blank = '';
tags.continue = ':       ';
tags.info = chalk.cyan('INFO: ');
tags.warn = chalk.yellow('WARN: ');
tags.data = chalk.green('DATA: ');
tags.error = chalk.red('ERROR: ');
tags.fatal = chalk.bold.red('FATAL: ');
tags.state = chalk.magenta('STATE: ');
let logStream = null;
let logFile = null;
let logFileOK = false;
let accessStream = null;
let accessFile = null;
let accessFileOK = false;
let clientStream = null;
let clientFile = null;
let clientFileOK = false;

function setDateFormat(dt) {
  dateFormat = dt;
}

function setRingLength() {
  ringLength = 100;
}

function combineMessages(...messages) {
  let msg = '';
  // eslint-disable-next-line no-restricted-syntax
  for (const message of messages) {
    msg += typeof message === 'object' ? JSON.stringify(message) : message;
    msg += ' ';
  }
  return msg;
}

function print(...messages) {
  const time = moment(Date.now()).format(dateFormat);
  // eslint-disable-next-line no-console
  console.log(time, ...messages);
}

function setLogFile(file) {
  logFile = file;
  print(tags.state, 'Application log set to', path.resolve(logFile));
  logFileOK = true;
  logStream = fs.createWriteStream(path.resolve(logFile), { flags: 'a' });
  logStream.on('error', (e) => {
    print(tags.error, 'Cannot open application log', `${logFile}: ${e.code}`);
    logFileOK = false;
  });
}

function setAccessFile(file) {
  accessFile = file;
  print(tags.state, 'Access log set to', path.resolve(accessFile));
  accessFileOK = true;
  accessStream = fs.createWriteStream(path.resolve(accessFile), { flags: 'a' });
  accessStream.on('error', (e) => {
    print(tags.error, 'Cannot open application log', `${logFile}: ${e.code}`);
    accessFileOK = false;
  });
}

function setClientFile(file) {
  clientFile = file;
  print(tags.state, 'Client log set to', path.resolve(clientFile));
  clientFileOK = true;
  clientStream = fs.createWriteStream(path.resolve(clientFile), { flags: 'a' });
  clientStream.on('error', (e) => {
    print(tags.error, 'Cannot open application log', `${logFile}: ${e.code}`);
    clientFileOK = false;
  });
}

async function log(tag, ...messages) {
  const time = moment(Date.now()).format(dateFormat);
  print(tags[tag], ...messages);
  if (logFileOK) logStream.write(`${time} ${tags[tag]} ${combineMessages(...messages)}\n`);
  ring.push({ tag, time, msg: combineMessages(...messages) });
  if (ring.length > ringLength) ring.shift();
}

async function access(...messages) {
  const time = moment(Date.now()).format(dateFormat);
  if (accessFileOK) accessStream.write(`${time} ${combineMessages(...messages)}\n`);
}

async function client(...messages) {
  const time = moment(Date.now()).format(dateFormat);
  if (clientFileOK) clientStream.write(`${time} ${combineMessages(...messages)}\n`);
}

function configure(options) {
  if (!options) return;
  if (options.dateFormat) dateFormat = options.dateFormat;
  if (options.ringLength) ringLength = options.ringLength;
  if (options.logFile) setLogFile(options.logFile);
  if (options.accessFile) setAccessFile(options.accessFile);
  if (options.clientFile) setClientFile(options.clientFile);
}

// local ring buffer
exports.ring = ring;
// config items
exports.ringLength = setRingLength;
exports.dateFormat = setDateFormat;
// simple replacement for console.log
exports.console = print;
// simple logging to application log
exports.logFile = setLogFile;
exports.blank = (...message) => log('blank', ...message);
exports.warn = (...message) => log('warn', ...message);
exports.info = (...message) => log('info', ...message);
exports.data = (...message) => log('data', ...message);
exports.error = (...message) => log('error', ...message);
exports.fatal = (...message) => log('fatal', ...message);
exports.state = (...message) => log('state', ...message);
// simple logging to access file
exports.accessFile = setAccessFile;
exports.access = (...message) => access(...message);
// simple logging to client file
exports.clientFile = setClientFile;
exports.client = (...message) => client(...message);
// configure log object
exports.configure = configure;
