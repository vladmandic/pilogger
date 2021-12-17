"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.tags = void 0;
var os = require("os");
var fs = require("fs");
var path = require("path");
var dayjs_1 = require("dayjs");
var chalk_1 = require("chalk");
var console_1 = require("console");
var chalk = new chalk_1.Chalk({ level: 2 });
var ring = [];
var options = {
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
    ringLength: 100,
    console: true,
    timeStamp: true
};
var streams = {
    logFile: false,
    accessFile: false,
    clientFile: false,
    logStream: undefined,
    accessStream: undefined,
    clientStream: undefined
};
exports.tags = {
    blank: '',
    "continue": ':     ',
    info: chalk.cyan('INFO: '),
    warn: chalk.yellow('WARN: '),
    data: chalk.green('DATA: '),
    error: chalk.red('ERROR:'),
    fatal: chalk.bold.red('FATAL:'),
    assert: chalk.italic.bold.red('ASSERT:'),
    timed: chalk.magentaBright('TIMED:'),
    state: chalk.magenta('STATE:'),
    verbose: chalk.bgGray.yellowBright('VERB: '),
    debug: chalk.bgGray.redBright('DEBUG:')
};
var inspectOptions = {
    showHidden: false,
    depth: 5,
    colors: true,
    showProxy: true,
    maxArrayLength: 1024,
    maxStringLength: 10240,
    breakLength: 200,
    compact: 64,
    sorted: false,
    getters: false
};
var logger = new console_1.Console({
    stdout: process.stdout,
    stderr: process.stderr,
    ignoreErrors: true,
    inspectOptions: inspectOptions
});
function setDateFormat(dt) {
    options.dateFormat = dt;
}
function setRingLength() {
    options.ringLength = 100;
}
function combineMessages() {
    var messages = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        messages[_i] = arguments[_i];
    }
    var msg = '';
    for (var _a = 0, messages_1 = messages; _a < messages_1.length; _a++) {
        var message = messages_1[_a];
        msg += typeof message === 'object' ? JSON.stringify(message) : message;
        msg += ' ';
    }
    return msg;
}
function print() {
    var messages = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        messages[_i] = arguments[_i];
    }
    var time = (0, dayjs_1["default"])(Date.now()).format(options.dateFormat);
    if (options.console) {
        if (options.timeStamp)
            logger.log.apply(logger, __spreadArray([time], messages, false));
        else
            logger.log.apply(logger, messages);
    }
}
function setLogFile(file) {
    if (typeof file !== 'string')
        return;
    options.logFile = file;
    streams.logFile = true;
    streams.logStream = fs.createWriteStream(path.resolve(options.logFile || ''), { flags: 'a' });
    if (streams.logStream)
        streams.logStream.on('error', function (e) {
            print(exports.tags.error, 'Cannot open application log', options.logFile, e);
            streams.logFile = false;
        });
}
function setAccessFile(file) {
    if (typeof file !== 'string')
        return;
    options.accessFile = file;
    streams.accessFile = true;
    streams.accessStream = fs.createWriteStream(path.resolve(options.accessFile), { flags: 'a' });
    if (streams.accessStream)
        streams.accessStream.on('error', function (e) {
            print(exports.tags.error, 'Cannot open application log', options.accessFile, e);
            streams.accessFile = false;
        });
}
function setClientFile(file) {
    if (typeof file !== 'string')
        return;
    options.clientFile = file;
    streams.clientFile = true;
    streams.clientStream = fs.createWriteStream(path.resolve(options.clientFile), { flags: 'a' });
    if (streams.clientStream)
        streams.clientStream.on('error', function (e) {
            print(exports.tags.error, 'Cannot open application log', options.clientFile, e);
            streams.clientFile = false;
        });
}
function assert(res, exp) {
    var messages = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        messages[_i - 2] = arguments[_i];
    }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (res !== exp)
                log.apply(void 0, __spreadArray(__spreadArray(['assert'], messages, false), [{ res: res, exp: exp }], false));
            return [2 /*return*/];
        });
    });
}
function timed(t0) {
    var messages = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        messages[_i - 1] = arguments[_i];
    }
    return __awaiter(this, arguments, void 0, function () {
        var t1, elapsed, time;
        return __generator(this, function (_a) {
            if (arguments.length < 2) {
                messages = [t0];
                t0 = process.hrtime.bigint();
            }
            t1 = process.hrtime.bigint();
            elapsed = 0;
            try {
                elapsed = parseInt((t1 - t0).toString());
            }
            catch ( /**/_b) { /**/ }
            elapsed = Math.round(elapsed / 1000000);
            time = (0, dayjs_1["default"])(Date.now()).format(options.dateFormat);
            if (options.console)
                logger.log.apply(logger, __spreadArray([time, exports.tags.timed, "".concat(elapsed.toLocaleString(), " ms")], messages, false));
            if (streams.logFile && streams.logStream)
                streams.logStream.write("".concat(exports.tags.timed, " ").concat(time, " ").concat(elapsed.toLocaleString(), " ms ").concat(combineMessages.apply(void 0, messages), "\n"));
            return [2 /*return*/];
        });
    });
}
function log(tag) {
    var messages = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        messages[_i - 1] = arguments[_i];
    }
    return __awaiter(this, void 0, void 0, function () {
        var time;
        return __generator(this, function (_a) {
            time = (0, dayjs_1["default"])(Date.now()).format(options.dateFormat);
            if (exports.tags[tag])
                print.apply(void 0, __spreadArray([exports.tags[tag]], messages, false));
            else
                print.apply(void 0, messages);
            if (streams.logFile && streams.logStream)
                streams.logStream.write("".concat(time, " ").concat(exports.tags[tag], " ").concat(combineMessages.apply(void 0, messages), "\n"));
            ring.push({ tag: tag, time: time, msg: combineMessages.apply(void 0, messages) });
            if (ring.length > options.ringLength)
                ring.shift();
            return [2 /*return*/];
        });
    });
}
function access() {
    var messages = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        messages[_i] = arguments[_i];
    }
    return __awaiter(this, void 0, void 0, function () {
        var time;
        return __generator(this, function (_a) {
            time = (0, dayjs_1["default"])(Date.now()).format(options.dateFormat);
            if (streams.accessFile && streams.accessStream)
                streams.accessStream.write("".concat(time, " ").concat(combineMessages.apply(void 0, messages), "\n"));
            return [2 /*return*/];
        });
    });
}
function client() {
    var messages = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        messages[_i] = arguments[_i];
    }
    return __awaiter(this, void 0, void 0, function () {
        var time;
        return __generator(this, function (_a) {
            time = (0, dayjs_1["default"])(Date.now()).format(options.dateFormat);
            if (streams.clientFile && streams.clientStream)
                streams.clientStream.write("".concat(time, " ").concat(combineMessages.apply(void 0, messages), "\n"));
            return [2 /*return*/];
        });
    });
}
function configure(userOptions) {
    if (!userOptions)
        return;
    if (userOptions.dateFormat)
        options.dateFormat = userOptions.dateFormat;
    if (userOptions.ringLength)
        options.ringLength = userOptions.ringLength;
    if (userOptions.logFile)
        setLogFile(userOptions.logFile);
    if (userOptions.accessFile)
        setAccessFile(userOptions.accessFile);
    if (userOptions.clientFile)
        setClientFile(userOptions.clientFile);
    if (userOptions.inspect)
        inspectOptions = __assign(__assign({}, inspectOptions), userOptions.inspect);
    logger = new console_1.Console({
        stdout: process.stdout,
        stderr: process.stderr,
        ignoreErrors: true,
        inspectOptions: inspectOptions
    });
}
function header() {
    var f = './package.json';
    if (!fs.existsSync(f))
        return;
    var node = JSON.parse(fs.readFileSync(f).toString());
    process.title = node.name;
    log('info', node.name, 'version', node.version);
    log('info', 'User:', os.userInfo().username, 'Platform:', process.platform, 'Arch:', process.arch, 'Node:', process.version);
    if (options.logFile && streams.logFile)
        print(exports.tags.state, 'Application log:', path.resolve(options.logFile));
    if (options.accessFile && streams.accessFile)
        print(exports.tags.state, 'Access log:', path.resolve(options.accessFile));
    if (options.clientFile && streams.clientFile)
        print(exports.tags.state, 'Client log:', path.resolve(options.clientFile));
}
function headerJson() {
    var f = './package.json';
    if (!fs.existsSync(f))
        return;
    var node = JSON.parse(fs.readFileSync(f).toString());
    process.title = node.name;
    log('info', { application: node.name, version: node.version });
    log('info', { user: os.userInfo().username, platform: process.platform, arch: process.arch, node: process.version });
    if (options.logFile || options.accessFile || options.clientFile)
        print(exports.tags.state, { log: path.resolve(options.logFile || ''), access: path.resolve(options.accessFile || ''), client: path.resolve(options.clientFile || '') });
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
exports.blank = function () {
    var message = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        message[_i] = arguments[_i];
    }
    return log.apply(void 0, __spreadArray(['blank'], message, false));
};
exports.info = function () {
    var message = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        message[_i] = arguments[_i];
    }
    return log.apply(void 0, __spreadArray(['info'], message, false));
};
exports.state = function () {
    var message = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        message[_i] = arguments[_i];
    }
    return log.apply(void 0, __spreadArray(['state'], message, false));
};
exports.data = function () {
    var message = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        message[_i] = arguments[_i];
    }
    return log.apply(void 0, __spreadArray(['data'], message, false));
};
exports.warn = function () {
    var message = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        message[_i] = arguments[_i];
    }
    return log.apply(void 0, __spreadArray(['warn'], message, false));
};
exports.error = function () {
    var message = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        message[_i] = arguments[_i];
    }
    return log.apply(void 0, __spreadArray(['error'], message, false));
};
exports.fatal = function () {
    var message = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        message[_i] = arguments[_i];
    }
    return log.apply(void 0, __spreadArray(['fatal'], message, false));
};
exports.verbose = function () {
    var message = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        message[_i] = arguments[_i];
    }
    return log.apply(void 0, __spreadArray(['verbose'], message, false));
};
exports.debug = function () {
    var message = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        message[_i] = arguments[_i];
    }
    return log.apply(void 0, __spreadArray(['debug'], message, false));
};
exports.access = function () {
    var message = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        message[_i] = arguments[_i];
    }
    return access.apply(void 0, message);
}; // simple logging to access file
exports.client = function () {
    var message = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        message[_i] = arguments[_i];
    }
    return client.apply(void 0, message);
}; // simple logging to client file
