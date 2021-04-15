const os = require('os');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const dayjs = require('dayjs');
const { Console } = require('console');

const ctx = new chalk.Instance({ level: 2 });

const ring = [];
let dateFormat = 'YYYY-MM-DD HH:mm:ss';
let ringLength = 100;
let logStream = null;
let logFile = null;
let logFileOK = false;
let accessStream = null;
let accessFile = null;
let accessFileOK = false;
let clientStream = null;
let clientFile = null;
let clientFileOK = false;
const tags = {
  blank: '',
  continue: ':     ',
  info: ctx.cyan('INFO: '),
  warn: ctx.yellow('WARN: '),
  data: ctx.green('DATA: '),
  error: ctx.red('ERROR:'),
  fatal: ctx.bold.red('FATAL:'),
  timed: ctx.magentaBright('TIMED:'),
  state: ctx.magenta('STATE:'),
};
let inspectOptions = {
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
};
let logger = new Console({
  stdout: process.stdout,
  stderr: process.stderr,
  ignoreErrors: true,
  // groupIndentation: 2,
  inspectOptions,
});

function setDateFormat(dt) {
  dateFormat = dt;
}

function setRingLength() {
  ringLength = 100;
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
  const time = dayjs(Date.now()).format(dateFormat);
  logger.log(time, ...messages);
}

function setLogFile(file) {
  logFile = file;
  logFileOK = true;
  logStream = fs.createWriteStream(path.resolve(logFile), { flags: 'a' });
  logStream.on('error', (e) => {
    // @ts-ignore
    print(tags.error, 'Cannot open application log', `${logFile}: ${e.code}`);
    logFileOK = false;
  });
}

function setAccessFile(file) {
  accessFile = file;
  accessFileOK = true;
  accessStream = fs.createWriteStream(path.resolve(accessFile), { flags: 'a' });
  accessStream.on('error', (e) => {
    // @ts-ignore
    print(tags.error, 'Cannot open application log', `${logFile}: ${e.code}`);
    accessFileOK = false;
  });
}

function setClientFile(file) {
  clientFile = file;
  clientFileOK = true;
  clientStream = fs.createWriteStream(path.resolve(clientFile), { flags: 'a' });
  clientStream.on('error', (e) => {
    // @ts-ignore
    print(tags.error, 'Cannot open application log', `${logFile}: ${e.code}`);
    clientFileOK = false;
  });
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
  const time = dayjs(Date.now()).format(dateFormat);
  logger.log(time, tags.timed, `${elapsed.toLocaleString()} ms`, ...messages);
  if (logFileOK) logStream.write(`${tags.timed} ${time} ${elapsed.toLocaleString()} ms ${combineMessages(...messages)}\n`);
}

async function log(tag, ...messages) {
  const time = dayjs(Date.now()).format(dateFormat);
  if (tags[tag]) print(tags[tag], ...messages);
  else print(...messages);
  if (logFileOK) logStream.write(`${time} ${tags[tag]} ${combineMessages(...messages)}\n`);
  ring.push({ tag, time, msg: combineMessages(...messages) });
  if (ring.length > ringLength) ring.shift();
}

async function access(...messages) {
  const time = dayjs(Date.now()).format(dateFormat);
  if (accessFileOK) accessStream.write(`${time} ${combineMessages(...messages)}\n`);
}

async function client(...messages) {
  const time = dayjs(Date.now()).format(dateFormat);
  if (clientFileOK) clientStream.write(`${time} ${combineMessages(...messages)}\n`);
}

function configure(options) {
  if (!options) return;
  if (options.dateFormat) dateFormat = options.dateFormat;
  if (options.ringLength) ringLength = options.ringLength;
  if (options.logFile) setLogFile(options.logFile);
  if (options.accessFile) setAccessFile(options.accessFile);
  if (options.clientFile) setClientFile(options.clientFile);
  if (options.inspect) inspectOptions = { ...inspectOptions, ...options.inspect };
  logger = new Console({
    stdout: process.stdout,
    stderr: process.stderr,
    ignoreErrors: true,
    // groupIndentation: 2,
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
  if (logFile && logFileOK) print(tags.state, 'Application log:', path.resolve(logFile));
  if (accessFile && accessFileOK) print(tags.state, 'Access log:', path.resolve(logFile));
  if (clientFile && clientFileOK) print(tags.state, 'Client log:', path.resolve(logFile));
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

try {
  if (require.main === module) test();
} catch {
  //
}

// local ring buffer
exports.ring = ring;
// config items
exports.ringLength = setRingLength;
exports.dateFormat = setDateFormat;
// simple replacement for logger.log
exports.console = print;
// log with timing
exports.timed = timed;
// simple logging to application log
exports.logFile = setLogFile;
exports.blank = (...message) => log(...message);
exports.info = (...message) => log('info', ...message);
exports.state = (...message) => log('state', ...message);
exports.data = (...message) => log('data', ...message);
exports.warn = (...message) => log('warn', ...message);
exports.error = (...message) => log('error', ...message);
exports.fatal = (...message) => log('fatal', ...message);
// simple logging to access file
exports.accessFile = setAccessFile;
exports.access = (...message) => access(...message);
// simple logging to client file
exports.clientFile = setClientFile;
exports.client = (...message) => client(...message);
// configure log object
exports.configure = configure;
// print basic header
exports.header = header;
