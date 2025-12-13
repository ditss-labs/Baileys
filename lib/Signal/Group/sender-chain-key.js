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
exports.SenderChainKey = void 0;
const crypto_1 = require("libsignal/src/crypto");
const sender_message_key_1 = require("./sender-message-key");
class SenderChainKey {
    constructor(iteration, chainKey) {
        this.MESSAGE_KEY_SEED = Buffer.from([0x01]);
        this.CHAIN_KEY_SEED = Buffer.from([0x02]);
        this.iteration = iteration;
        if (chainKey instanceof Buffer) {
            this.chainKey = chainKey;
        }
        else {
            this.chainKey = Buffer.from(chainKey || []);
        }
    }
    getIteration() {
        return this.iteration;
    }
    getSenderMessageKey() {
        return new sender_message_key_1.SenderMessageKey(this.iteration, this.getDerivative(this.MESSAGE_KEY_SEED, this.chainKey));
    }
    getNext() {
        return new SenderChainKey(this.iteration + 1, this.getDerivative(this.CHAIN_KEY_SEED, this.chainKey));
    }
    getSeed() {
        return this.chainKey;
    }
    getDerivative(seed, key) {
        return (0, crypto_1.calculateMAC)(key, seed);
    }
}
exports.SenderChainKey = SenderChainKey;
