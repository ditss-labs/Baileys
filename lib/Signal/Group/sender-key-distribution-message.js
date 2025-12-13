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
exports.SenderKeyDistributionMessage = void 0;
const WAProto_1 = require("../../../WAProto");
const ciphertext_message_1 = require("./ciphertext-message");
class SenderKeyDistributionMessage extends ciphertext_message_1.CiphertextMessage {
    constructor(id, iteration, chainKey, signatureKey, serialized) {
        super();
        if (serialized) {
            try {
                const message = serialized.slice(1);
                const distributionMessage = WAProto_1.proto.SenderKeyDistributionMessage.decode(message).toJSON();
                this.serialized = serialized;
                this.id = distributionMessage.id;
                this.iteration = distributionMessage.iteration;
                this.chainKey =
                    typeof distributionMessage.chainKey === 'string'
                        ? Buffer.from(distributionMessage.chainKey, 'base64')
                        : distributionMessage.chainKey;
                this.signatureKey =
                    typeof distributionMessage.signingKey === 'string'
                        ? Buffer.from(distributionMessage.signingKey, 'base64')
                        : distributionMessage.signingKey;
            }
            catch (e) {
                throw new Error(String(e));
            }
        }
        else {
            const version = this.intsToByteHighAndLow(this.CURRENT_VERSION, this.CURRENT_VERSION);
            this.id = id;
            this.iteration = iteration;
            this.chainKey = chainKey;
            this.signatureKey = signatureKey;
            const message = WAProto_1.proto.SenderKeyDistributionMessage.encode(WAProto_1.proto.SenderKeyDistributionMessage.create({
                id,
                iteration,
                chainKey,
                signingKey: this.signatureKey
            })).finish();
            this.serialized = Buffer.concat([Buffer.from([version]), message]);
        }
    }
    intsToByteHighAndLow(highValue, lowValue) {
        return (((highValue << 4) | lowValue) & 0xff) % 256;
    }
    serialize() {
        return this.serialized;
    }
    getType() {
        return this.SENDERKEY_DISTRIBUTION_TYPE;
    }
    getIteration() {
        return this.iteration;
    }
    getChainKey() {
        return typeof this.chainKey === 'string' ? Buffer.from(this.chainKey, 'base64') : this.chainKey;
    }
    getSignatureKey() {
        return typeof this.signatureKey === 'string' ? Buffer.from(this.signatureKey, 'base64') : this.signatureKey;
    }
    getId() {
        return this.id;
    }
}
exports.SenderKeyDistributionMessage = SenderKeyDistributionMessage;
