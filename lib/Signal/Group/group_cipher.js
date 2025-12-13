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
exports.GroupCipher = void 0;
const crypto_1 = require("libsignal/src/crypto");
const queue_job_1 = __importDefault(require("./queue-job"));
const sender_key_message_1 = require("./sender-key-message");
class GroupCipher {
    constructor(senderKeyStore, senderKeyName) {
        this.senderKeyStore = senderKeyStore;
        this.senderKeyName = senderKeyName;
    }
    queueJob(awaitable) {
        return (0, queue_job_1.default)(this.senderKeyName.toString(), awaitable);
    }
    async encrypt(paddedPlaintext) {
        return await this.queueJob(async () => {
            const record = await this.senderKeyStore.loadSenderKey(this.senderKeyName);
            if (!record) {
                throw new Error('No SenderKeyRecord found for encryption');
            }
            const senderKeyState = record.getSenderKeyState();
            if (!senderKeyState) {
                throw new Error('No session to encrypt message');
            }
            const iteration = senderKeyState.getSenderChainKey().getIteration();
            const senderKey = this.getSenderKey(senderKeyState, iteration === 0 ? 0 : iteration + 1);
            const ciphertext = await this.getCipherText(senderKey.getIv(), senderKey.getCipherKey(), paddedPlaintext);
            const senderKeyMessage = new sender_key_message_1.SenderKeyMessage(senderKeyState.getKeyId(), senderKey.getIteration(), ciphertext, senderKeyState.getSigningKeyPrivate());
            await this.senderKeyStore.storeSenderKey(this.senderKeyName, record);
            return senderKeyMessage.serialize();
        });
    }
    async decrypt(senderKeyMessageBytes) {
        return await this.queueJob(async () => {
            const record = await this.senderKeyStore.loadSenderKey(this.senderKeyName);
            if (!record) {
                throw new Error('No SenderKeyRecord found for decryption');
            }
            const senderKeyMessage = new sender_key_message_1.SenderKeyMessage(null, null, null, null, senderKeyMessageBytes);
            const senderKeyState = record.getSenderKeyState(senderKeyMessage.getKeyId());
            if (!senderKeyState) {
                throw new Error('No session found to decrypt message');
            }
            senderKeyMessage.verifySignature(senderKeyState.getSigningKeyPublic());
            const senderKey = this.getSenderKey(senderKeyState, senderKeyMessage.getIteration());
            const plaintext = await this.getPlainText(senderKey.getIv(), senderKey.getCipherKey(), senderKeyMessage.getCipherText());
            await this.senderKeyStore.storeSenderKey(this.senderKeyName, record);
            return plaintext;
        });
    }
    getSenderKey(senderKeyState, iteration) {
        let senderChainKey = senderKeyState.getSenderChainKey();
        if (senderChainKey.getIteration() > iteration) {
            if (senderKeyState.hasSenderMessageKey(iteration)) {
                const messageKey = senderKeyState.removeSenderMessageKey(iteration);
                if (!messageKey) {
                    throw new Error('No sender message key found for iteration');
                }
                return messageKey;
            }
            throw new Error(`Received message with old counter: ${senderChainKey.getIteration()}, ${iteration}`);
        }
        if (iteration - senderChainKey.getIteration() > 2000) {
            throw new Error('Over 2000 messages into the future!');
        }
        while (senderChainKey.getIteration() < iteration) {
            senderKeyState.addSenderMessageKey(senderChainKey.getSenderMessageKey());
            senderChainKey = senderChainKey.getNext();
        }
        senderKeyState.setSenderChainKey(senderChainKey.getNext());
        return senderChainKey.getSenderMessageKey();
    }
    async getPlainText(iv, key, ciphertext) {
        try {
            return (0, crypto_1.decrypt)(key, ciphertext, iv);
        }
        catch (e) {
            throw new Error('InvalidMessageException');
        }
    }
    async getCipherText(iv, key, plaintext) {
        try {
            const ivBuffer = typeof iv === 'string' ? Buffer.from(iv, 'base64') : iv;
            const keyBuffer = typeof key === 'string' ? Buffer.from(key, 'base64') : key;
            const plaintextBuffer = typeof plaintext === 'string' ? Buffer.from(plaintext) : plaintext;
            return (0, crypto_1.encrypt)(keyBuffer, plaintextBuffer, ivBuffer);
        }
        catch (e) {
            throw new Error('InvalidMessageException');
        }
    }
}
exports.GroupCipher = GroupCipher;
