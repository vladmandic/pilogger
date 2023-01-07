/// <reference types="node" />
import * as fs from 'fs';
export type Ring = {
    tag: string;
    time: string;
    msg: string;
};
export declare const ring: Ring[];
export type Options = {
    dateFormat: string;
    ringLength: number;
    console: boolean;
    timeStamp: boolean;
    logFile?: string;
    accessFile?: string;
    clientFile?: string;
    inspect?: any;
};
export declare const options: Options;
export type Streams = {
    logFile: boolean;
    accessFile: boolean;
    clientFile: boolean;
    logStream: fs.WriteStream | undefined;
    accessStream: fs.WriteStream | undefined;
    clientStream: fs.WriteStream | undefined;
};
export type Tags = 'blank' | 'continue' | 'info' | 'warn' | 'data' | 'error' | 'fatal' | 'assert' | 'timed' | 'state' | 'verbose' | 'debug' | 'console';
export declare const tags: {
    blank: string;
    continue: string;
    info: string;
    warn: string;
    data: string;
    error: string;
    fatal: string;
    assert: string;
    timed: string;
    state: string;
    verbose: string;
    debug: string;
    console: string;
};
export declare function print(...messages: any[]): void;
export declare function logFile(file: string): void;
export declare function accessFile(file: string): void;
export declare function clientFile(file: string): void;
export declare function timed(t0: bigint, ...messages: string[]): Promise<void>;
export declare function assert(res: any, exp: any, ...messages: string[]): Promise<void>;
export declare function access(...messages: any[]): Promise<void>;
export declare function client(...messages: any[]): Promise<void>;
export declare function configure(userOptions: Partial<Options>): void;
export declare function header(): void;
export declare function headerJson(): void;
export declare const blank: (...message: any[]) => Promise<void>;
export declare const info: (...message: any[]) => Promise<void>;
export declare const state: (...message: any[]) => Promise<void>;
export declare const data: (...message: any[]) => Promise<void>;
export declare const warn: (...message: any[]) => Promise<void>;
export declare const error: (...message: any[]) => Promise<void>;
export declare const fatal: (...message: any[]) => Promise<void>;
export declare const verbose: (...message: any[]) => Promise<void>;
export declare const debug: (...message: any[]) => Promise<void>;
export declare const console: (...message: any[]) => Promise<void>;
//# sourceMappingURL=pilogger.d.ts.map