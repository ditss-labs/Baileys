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
exports.SenderKeyName = void 0;
function isNull(str) {
    return str === null || str === '';
}
function intValue(num) {
    const MAX_VALUE = 0x7fffffff;
    const MIN_VALUE = -0x80000000;
    if (num > MAX_VALUE || num < MIN_VALUE) {
        return num & 0xffffffff;
    }
    return num;
}
function hashCode(strKey) {
    let hash = 0;
    if (!isNull(strKey)) {
        for (let i = 0; i < strKey.length; i++) {
            hash = hash * 31 + strKey.charCodeAt(i);
            hash = intValue(hash);
        }
    }
    return hash;
}
class SenderKeyName {
    constructor(groupId, sender) {
        this.groupId = groupId;
        this.sender = sender;
    }
    getGroupId() {
        return this.groupId;
    }
    getSender() {
        return this.sender;
    }
    serialize() {
        return `${this.groupId}::${this.sender.id}::${this.sender.deviceId}`;
    }
    toString() {
        return this.serialize();
    }
    equals(other) {
        if (other === null)
            return false;
        return this.groupId === other.groupId && this.sender.toString() === other.sender.toString();
    }
    hashCode() {
        return hashCode(this.groupId) ^ hashCode(this.sender.toString());
    }
}
exports.SenderKeyName = SenderKeyName;
