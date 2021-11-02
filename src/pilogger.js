const os = require('os');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const dayjs = require('dayjs');
const { Console } = require('console');

const ctx = new chalk.Instance({ level: 2 });

const ring = [];

const options = {
  dateFormat: 'YYYY-MM-DD HH:mm:ss',
  ringLength: 100,
  console: true,
  timeStamp: true,
  // logFile: null,
  // accessFile: null,
  // clientFile: null,
}

const streams = {
  logFile: false,
  accessFile: false,
  clientFile: false,
  // logStream: null,
  // accessStream: null,
  // clientStream: null,
}

const tags = {
  blank: '',
  continue: ':     ',
  info: ctx.cyan('INFO: '),
  warn: ctx.yellow('WARN: '),
  data: ctx.green('DATA: '),
  error: ctx.red('ERROR:'),
  fatal: ctx.bold.red('FATAL:'),
  assert: ctx.italic.bold.red('ASSERT:'),
  timed: ctx.magentaBright('TIMED:'),
  state: ctx.magenta('STATE:'),
  verbose: ctx.bgGray.yellowBright('VERB: '),
  debug: ctx.bgGray.redBright('DEBUG:')
};

let inspectOptions = { // options passed to nodejs console constructor
  showHidden: false,
  depth: 5,
  colors: true,
  showProxy: true,
  maxArrayLength: 1024,
  maxStringLength: 10240,
  breakLength: 200,
  compact: 64,
  sorted: false,
  getters: false,
};

let logger = new Console({
  stdout: process.stdout,
  stderr: process.stderr,
  ignoreErrors: true,
  inspectOptions,
});

function setDateFormat(dt) {
  options.dateFormat = dt;
}

function setRingLength() {
  options.ringLength = 100;
}

function combineMessages(...messages) {
  let msg = '';
  for (const message of messages) {
    msg += typeof message === 'object' ? JSON.stringify(message) : message;
    msg += ' ';
  }
  return msg;
}

function print(...messages) {
  const time = dayjs(Date.now()).format(options.dateFormat);
  if (options.console) {
    if (options.timeStamp) logger.log(time, ...messages);
    else logger.log(...messages);
  }
}

function setLogFile(file) {
  if (typeof file !== 'string') return;
  options.logFile = file;
  streams.logFile = true;
  streams.logStream = fs.createWriteStream(path.resolve(options.logFile || ''), { flags: 'a' });
  if (streams.logStream) streams.logStream.on('error', (e) => {
    print(tags.error, 'Cannot open application log', `${options.logFile}: ${e.code}`);
    streams.logFile = false;
  });
}

function setAccessFile(file) {
  if (typeof file !== 'string') return;
  options.accessFile = file;
  streams.accessFile = true;
  streams.accessStream = fs.createWriteStream(path.resolve(options.accessFile), { flags: 'a' });
  if (streams.accessStream) streams.accessStream.on('error', (e) => {
    print(tags.error, 'Cannot open application log', `${options.logFile}: ${e.code}`);
    streams.accessFile = false;
  });
}

function setClientFile(file) {
  if (typeof file !== 'string') return;
  options.clientFile = file;
  streams.clientFile = true;
  streams.clientStream = fs.createWriteStream(path.resolve(options.clientFile), { flags: 'a' });
  if (streams.clientStream) streams.clientStream.on('error', (e) => {
    print(tags.error, 'Cannot open application log', `${options.logFile}: ${e.code}`);
    streams.clientFile = false;
  });
}

async function assert(res, exp, ...messages) {
  if (res !== exp) log('assert', ...messages, { res, exp });
}

async function timed(t0, ...messages) {
  if (arguments.length < 2) {
    messages = [t0];
    t0 = process.hrtime.bigint();
  }
  const t1 = process.hrtime.bigint();
  let elapsed = 0;
  try {
    elapsed = parseInt((t1 - t0).toString());
  } catch { /**/ }
  elapsed = Math.round(elapsed / 1000000);
  const time = dayjs(Date.now()).format(options.dateFormat);
  if (options.console) logger.log(time, tags.timed, `${elapsed.toLocaleString()} ms`, ...messages);
  if (streams.logFile) streams.logStream.write(`${tags.timed} ${time} ${elapsed.toLocaleString()} ms ${combineMessages(...messages)}\n`);
}

async function log(tag, ...messages) {
  const time = dayjs(Date.now()).format(options.dateFormat);
  if (tags[tag]) print(tags[tag], ...messages);
  else print(...messages);
  if (streams.logFile && streams.logStream) streams.logStream.write(`${time} ${tags[tag]} ${combineMessages(...messages)}\n`);
  ring.push({ tag, time, msg: combineMessages(...messages) });
  if (ring.length > options.ringLength) ring.shift();
}

async function access(...messages) {
  const time = dayjs(Date.now()).format(options.dateFormat);
  if (streams.accessFile && streams.accessStream) streams.accessStream.write(`${time} ${combineMessages(...messages)}\n`);
}

async function client(...messages) {
  const time = dayjs(Date.now()).format(options.dateFormat);
  if (streams.clientFile && streams.clientStream) streams.clientStream.write(`${time} ${combineMessages(...messages)}\n`);
}

function configure(userOptions) {
  if (!userOptions) return;
  if (userOptions.dateFormat) options.dateFormat = options.dateFormat;
  if (userOptions.ringLength) options.ringLength = options.ringLength;
  if (userOptions.logFile) setLogFile(options.logFile);
  if (userOptions.accessFile) setAccessFile(options.accessFile);
  if (userOptions.clientFile) setClientFile(options.clientFile);
  if (userOptions.inspect) inspectOptions = { ...inspectOptions, ...userOptions.inspect };
  logger = new Console({
    stdout: process.stdout,
    stderr: process.stderr,
    ignoreErrors: true,
    inspectOptions,
  });
}

function header() {
  const f = './package.json';
  if (!fs.existsSync(f)) return;
  const node = JSON.parse(fs.readFileSync(f).toString());
  process.title = node.name;
  log('info', node.name, 'version', node.version);
  log('info', 'User:', os.userInfo().username, 'Platform:', process.platform, 'Arch:', process.arch, 'Node:', process.version);
  if (options.logFile && streams.logFile) print(tags.state, 'Application log:', path.resolve(options.logFile));
  if (options.accessFile && streams.accessFile) print(tags.state, 'Access log:', path.resolve(options.logFile));
  if (options.clientFile && streams.clientFile) print(tags.state, 'Client log:', path.resolve(options.logFile));
}

function headerJson() {
  const f = './package.json';
  if (!fs.existsSync(f)) return;
  const node = JSON.parse(fs.readFileSync(f).toString());
  process.title = node.name;
  log('info', { application: node.name, version: node.version });
  log('info', { user: os.userInfo().username, platform: process.platform, arch: process.arch, node: process.version });
  if (options.logFile || options.accessFile || options.clientFile) print(tags.state, { log: path.resolve(options.logFile || ''), access: path.resolve(options.accessFile || ''), client: path.resolve(options.clientFile || '') });
}

function test() {
  header();
  const t0 = process.hrtime.bigint();
  log('info', 'Color support:', chalk.supportsColor);
  setTimeout(() => timed(t0, 'Test function execution'), 1000);
  const node = JSON.parse(fs.readFileSync('./package.json').toString());
  // configure({ inspect: { colors: false } });
  logger.log(node);
  log('blank', 'test blank');
  log('continue', 'test continue');
  log('info', 'test info');
  log('state', 'test state');
  log('data', 'test data');
  log('warn', 'test warn');
  log('error', 'test error');
  log('fatal', 'test fatal');
}

exports.ring = ring; // local ring buffer
exports.header = header; // print basic header
exports.headerJson = headerJson; // print basic header in json format

// options setters
exports.ringLength = setRingLength;
exports.dateFormat = setDateFormat;
exports.logFile = setLogFile; // simple logging to application log
exports.accessFile = setAccessFile;
exports.clientFile = setClientFile;
exports.configure = configure; // configure log object
exports.options = options;

// actual log methods
exports.console = print; // simple replacement for logger.log
exports.timed = timed; // log with timing
exports.assert = assert; // log if assertion failed
exports.blank = (...message) => log('', ...message);
exports.info = (...message) => log('info', ...message);
exports.state = (...message) => log('state', ...message);
exports.data = (...message) => log('data', ...message);
exports.warn = (...message) => log('warn', ...message);
exports.error = (...message) => log('error', ...message);
exports.fatal = (...message) => log('fatal', ...message);
exports.verbose = (...message) => log('verbose', ...message);
exports.debug = (...message) => log('debug', ...message);
exports.access = (...message) => access(...message); // simple logging to access file
exports.client = (...message) => client(...message); // simple logging to client file
