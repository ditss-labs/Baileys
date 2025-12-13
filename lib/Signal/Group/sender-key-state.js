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
exports.SenderKeyState = void 0;
const sender_chain_key_1 = require("./sender-chain-key");
const sender_message_key_1 = require("./sender-message-key");
class SenderKeyState {
    constructor(id, iteration, chainKey, signatureKeyPair, signatureKeyPublic, signatureKeyPrivate, senderKeyStateStructure) {
        this.MAX_MESSAGE_KEYS = 2000;
        if (senderKeyStateStructure) {
            this.senderKeyStateStructure = senderKeyStateStructure;
        }
        else {
            if (signatureKeyPair) {
                signatureKeyPublic = signatureKeyPair.public;
                signatureKeyPrivate = signatureKeyPair.private;
            }
            chainKey = typeof chainKey === 'string' ? Buffer.from(chainKey, 'base64') : chainKey;
            const senderChainKeyStructure = {
                iteration: iteration || 0,
                seed: chainKey || Buffer.alloc(0)
            };
            const signingKeyStructure = {
                public: typeof signatureKeyPublic === 'string'
                    ? Buffer.from(signatureKeyPublic, 'base64')
                    : signatureKeyPublic || Buffer.alloc(0)
            };
            if (signatureKeyPrivate) {
                signingKeyStructure.private =
                    typeof signatureKeyPrivate === 'string' ? Buffer.from(signatureKeyPrivate, 'base64') : signatureKeyPrivate;
            }
            this.senderKeyStateStructure = {
                senderKeyId: id || 0,
                senderChainKey: senderChainKeyStructure,
                senderSigningKey: signingKeyStructure,
                senderMessageKeys: []
            };
        }
    }
    getKeyId() {
        return this.senderKeyStateStructure.senderKeyId;
    }
    getSenderChainKey() {
        return new sender_chain_key_1.SenderChainKey(this.senderKeyStateStructure.senderChainKey.iteration, this.senderKeyStateStructure.senderChainKey.seed);
    }
    setSenderChainKey(chainKey) {
        this.senderKeyStateStructure.senderChainKey = {
            iteration: chainKey.getIteration(),
            seed: chainKey.getSeed()
        };
    }
    getSigningKeyPublic() {
        const publicKey = this.senderKeyStateStructure.senderSigningKey.public;
        if (publicKey instanceof Buffer) {
            return publicKey;
        }
        else if (typeof publicKey === 'string') {
            return Buffer.from(publicKey, 'base64');
        }
        return Buffer.from(publicKey || []);
    }
    getSigningKeyPrivate() {
        const privateKey = this.senderKeyStateStructure.senderSigningKey.private;
        if (!privateKey) {
            return undefined;
        }
        if (privateKey instanceof Buffer) {
            return privateKey;
        }
        else if (typeof privateKey === 'string') {
            return Buffer.from(privateKey, 'base64');
        }
        return Buffer.from(privateKey || []);
    }
    hasSenderMessageKey(iteration) {
        return this.senderKeyStateStructure.senderMessageKeys.some(key => key.iteration === iteration);
    }
    addSenderMessageKey(senderMessageKey) {
        this.senderKeyStateStructure.senderMessageKeys.push({
            iteration: senderMessageKey.getIteration(),
            seed: senderMessageKey.getSeed()
        });
        if (this.senderKeyStateStructure.senderMessageKeys.length > this.MAX_MESSAGE_KEYS) {
            this.senderKeyStateStructure.senderMessageKeys.shift();
        }
    }
    removeSenderMessageKey(iteration) {
        const index = this.senderKeyStateStructure.senderMessageKeys.findIndex(key => key.iteration === iteration);
        if (index !== -1) {
            const messageKey = this.senderKeyStateStructure.senderMessageKeys[index];
            this.senderKeyStateStructure.senderMessageKeys.splice(index, 1);
            return new sender_message_key_1.SenderMessageKey(messageKey.iteration, messageKey.seed);
        }
        return null;
    }
    getStructure() {
        return this.senderKeyStateStructure;
    }
}
exports.SenderKeyState = SenderKeyState;
