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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SenderMessageKey = void 0;
const crypto_1 = require("libsignal/src/crypto");
class SenderMessageKey {
    constructor(iteration, seed) {
        const derivative = (0, crypto_1.deriveSecrets)(seed, Buffer.alloc(32), Buffer.from('WhisperGroup'));
        const keys = new Uint8Array(32);
        keys.set(new Uint8Array(derivative[0].slice(16)));
        keys.set(new Uint8Array(derivative[1].slice(0, 16)), 16);
        this.iv = Buffer.from(derivative[0].slice(0, 16));
        this.cipherKey = Buffer.from(keys.buffer);
        this.iteration = iteration;
        this.seed = seed;
    }
    getIteration() {
        return this.iteration;
    }
    getIv() {
        return this.iv;
    }
    getCipherKey() {
        return this.cipherKey;
    }
    getSeed() {
        return this.seed;
    }
}
exports.SenderMessageKey = SenderMessageKey;
