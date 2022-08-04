import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import dayjs from 'dayjs';
import { Chalk } from 'chalk';
import { Console } from 'console';

const chalk = new Chalk({ level: 2 });

export type Ring = { tag: string, time: string, msg: string };
export const ring: Ring[] = [];

export type Options = {
  dateFormat: string,
  ringLength: number,
  console: boolean,
  timeStamp: boolean,
  logFile?: string,
  accessFile?: string,
  clientFile?: string,
  inspect?: any,
};
export const options: Options = {
  dateFormat: 'YYYY-MM-DD HH:mm:ss',
  ringLength: 100,
  console: true,
  timeStamp: true,
};

export type Streams = {
  logFile: boolean,
  accessFile: boolean,
  clientFile: boolean,
  logStream: fs.WriteStream | undefined,
  accessStream: fs.WriteStream | undefined,
  clientStream: fs.WriteStream | undefined,
};
const streams: Streams = {
  logFile: false,
  accessFile: false,
  clientFile: false,
  logStream: undefined,
  accessStream: undefined,
  clientStream: undefined,
};

export type Tags = 'blank' | 'continue' | 'info' | 'warn' | 'data' | 'error' | 'fatal' | 'assert' | 'timed' | 'state' | 'verbose' | 'debug' | 'console';
export const tags = {
  blank: '',
  continue: ':     ',
  info: chalk.cyan('INFO: '),
  warn: chalk.yellow('WARN: '),
  data: chalk.green('DATA: '),
  error: chalk.red('ERROR:'),
  fatal: chalk.bold.red('FATAL:'),
  assert: chalk.italic.bold.red('ASSERT:'),
  timed: chalk.magentaBright('TIMED:'),
  state: chalk.magenta('STATE:'),
  verbose: chalk.bgGray.yellowBright('VERB: '),
  debug: chalk.bgGray.redBright('DEBUG:'),
  console: chalk.gray('CONSOLE:'),
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

function stringify(message: any) {
  let str = '';
  try { str = JSON.stringify(message); } catch { /**/ }
  return str;
}

function combineMessages(...messages: string[]) {
  let msg = '';
  for (const message of messages) {
    msg += typeof message === 'object' ? stringify(message) : message;
    msg += ' ';
  }
  return msg;
}

export function print(...messages: any[]) {
  const time = dayjs(Date.now()).format(options.dateFormat);
  if (options.console) {
    if (options.timeStamp) logger.log(time, ...messages);
    else logger.log(...messages);
  }
}

export function logFile(file: string) {
  if (typeof file !== 'string') return;
  options.logFile = file;
  streams.logFile = true;
  streams.logStream = fs.createWriteStream(path.resolve(options.logFile || ''), { flags: 'a' });
  if (streams.logStream) {
    streams.logStream.on('error', (e) => {
      print(tags.error, 'Cannot open application log', options.logFile, e);
      streams.logFile = false;
    });
  }
}

export function accessFile(file: string) {
  if (typeof file !== 'string') return;
  options.accessFile = file;
  streams.accessFile = true;
  streams.accessStream = fs.createWriteStream(path.resolve(options.accessFile), { flags: 'a' });
  if (streams.accessStream) {
    streams.accessStream.on('error', (e) => {
      print(tags.error, 'Cannot open application log', options.accessFile, e);
      streams.accessFile = false;
    });
  }
}

export function clientFile(file: string) {
  if (typeof file !== 'string') return;
  options.clientFile = file;
  streams.clientFile = true;
  streams.clientStream = fs.createWriteStream(path.resolve(options.clientFile), { flags: 'a' });
  if (streams.clientStream) {
    streams.clientStream.on('error', (e) => {
      print(tags.error, 'Cannot open application log', options.clientFile, e);
      streams.clientFile = false;
    });
  }
}

export async function timed(t0: bigint, ...messages: string[]) {
  if (arguments.length < 2) {
    messages = [t0 as unknown as string];
    t0 = process.hrtime.bigint();
  }
  const t1 = process.hrtime.bigint();
  let elapsed = 0;
  try { elapsed = parseInt((t1 - t0).toString()); } catch { /**/ }
  elapsed = Math.round(elapsed / 1000000);
  const time = dayjs(Date.now()).format(options.dateFormat);
  if (options.console) logger.log(time, tags.timed, `${elapsed.toLocaleString()} ms`, ...messages);
  if (streams.logFile && streams.logStream) streams.logStream.write(`${tags.timed} ${time} ${elapsed.toLocaleString()} ms ${combineMessages(...messages)}\n`);
}

async function log(tag: Tags, ...messages: any[]) {
  const time = dayjs(Date.now()).format(options.dateFormat);
  if (tags[tag]) print(tags[tag], ...messages);
  else print(...messages);
  if (streams.logFile && streams.logStream) streams.logStream.write(`${time} ${tags[tag]} ${combineMessages(...messages)}\n`);
  ring.push({ tag, time, msg: combineMessages(...messages) });
  if (ring.length > options.ringLength) ring.shift();
}

export async function assert(res: any, exp: any, ...messages: string[]) {
  if (res !== exp) log('assert', ...messages, { res, exp });
}

export async function access(...messages: any[]) {
  const time = dayjs(Date.now()).format(options.dateFormat);
  if (streams.accessFile && streams.accessStream) streams.accessStream.write(`${time} ${combineMessages(...messages)}\n`);
}

export async function client(...messages: any[]) {
  const time = dayjs(Date.now()).format(options.dateFormat);
  if (streams.clientFile && streams.clientStream) streams.clientStream.write(`${time} ${combineMessages(...messages)}\n`);
}

export function configure(userOptions: Partial<Options>) {
  if (!userOptions) return;
  if (userOptions.dateFormat) options.dateFormat = userOptions.dateFormat;
  if (userOptions.ringLength) options.ringLength = userOptions.ringLength;
  if (userOptions.logFile) logFile(userOptions.logFile);
  if (userOptions.accessFile) accessFile(userOptions.accessFile);
  if (userOptions.clientFile) clientFile(userOptions.clientFile);
  if (userOptions.inspect) inspectOptions = { ...inspectOptions, ...userOptions.inspect };
  logger = new Console({
    stdout: process.stdout,
    stderr: process.stderr,
    ignoreErrors: true,
    inspectOptions,
  });
}

export function header() {
  const f = './package.json';
  if (!fs.existsSync(f)) return;
  const node = JSON.parse(fs.readFileSync(f).toString());
  process.title = node.name;
  log('info', node.name, 'version', node.version);
  log('info', 'User:', os.userInfo().username, 'Platform:', process.platform, 'Arch:', process.arch, 'Node:', process.version);
  if (options.logFile && streams.logFile) print(tags.state, 'Application log:', path.resolve(options.logFile));
  if (options.accessFile && streams.accessFile) print(tags.state, 'Access log:', path.resolve(options.accessFile));
  if (options.clientFile && streams.clientFile) print(tags.state, 'Client log:', path.resolve(options.clientFile));
}

export function headerJson() {
  const f = './package.json';
  if (!fs.existsSync(f)) return;
  const node = JSON.parse(fs.readFileSync(f).toString());
  process.title = node.name;
  log('info', { application: node.name, version: node.version });
  log('info', { user: os.userInfo().username, platform: process.platform, arch: process.arch, node: process.version });
  if (options.logFile || options.accessFile || options.clientFile) print(tags.state, { log: path.resolve(options.logFile || ''), access: path.resolve(options.accessFile || ''), client: path.resolve(options.clientFile || '') });
}

// actual log methods
export const blank = (...message: any[]) => log('blank', ...message);
export const info = (...message: any[]) => log('info', ...message);
export const state = (...message: any[]) => log('state', ...message);
export const data = (...message: any[]) => log('data', ...message);
export const warn = (...message: any[]) => log('warn', ...message);
export const error = (...message: any[]) => log('error', ...message);
export const fatal = (...message: any[]) => log('fatal', ...message);
export const verbose = (...message: any[]) => log('verbose', ...message);
export const debug = (...message: any[]) => log('debug', ...message);
export const console = (...message: any[]) => log('console', ...message);
