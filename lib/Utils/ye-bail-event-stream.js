/**
 * ye-bail - WhatsApp Web API Library
 * 
 * Copyright (C) 2025 yemobyte <yemobyte@gmail.com>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readAndEmitEventStream = exports.captureEventStream = void 0;
const events_1 = __importDefault(require("events"));
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const readline_1 = require("readline");
const generics_1 = require("./generics");
const make_mutex_1 = require("./make-mutex");
/**
 * Captures events from a ye-bail event emitter & stores them in a file
 * @param ev The event emitter to read events from
 * @param filename File to save to
 */
const captureEventStream = (ev, filename) => {
    const oldEmit = ev.emit;

    const writeMutex = (0, make_mutex_1.makeMutex)();

    ev.emit = function (...args) {
        const content = JSON.stringify({ timestamp: Date.now(), event: args[0], data: args[1] }) + '\n';
        const result = oldEmit.apply(ev, args);
        writeMutex.mutex(async () => {
            await (0, promises_1.writeFile)(filename, content, { flag: 'a' });
        });
        return result;
    };
};
exports.captureEventStream = captureEventStream;
/**
 * Read event file and emit events from there
 * @param filename filename containing event data
 * @param delayIntervalMs delay between each event emit
 */
const readAndEmitEventStream = (filename, delayIntervalMs = 0) => {
    const ev = new events_1.default();
    const fireEvents = async () => {

        const fileStream = (0, fs_1.createReadStream)(filename);
        const rl = (0, readline_1.createInterface)({
            input: fileStream,
            crlfDelay: Infinity
        });


        for await (const line of rl) {
            if (line) {
                const { event, data } = JSON.parse(line);
                ev.emit(event, data);
                delayIntervalMs && await (0, generics_1.delay)(delayIntervalMs);
            }
        }
        fileStream.close();
    };
    return {
        ev,
        task: fireEvents()
    };
};
exports.readAndEmitEventStream = readAndEmitEventStream;
