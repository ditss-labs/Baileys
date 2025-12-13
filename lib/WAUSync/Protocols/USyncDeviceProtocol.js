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
exports.USyncDeviceProtocol = void 0;
const WABinary_1 = require("../../WABinary");
class USyncDeviceProtocol {
    constructor() {
        this.name = 'devices';
    }
    getQueryElement() {
        return {
            tag: 'devices',
            attrs: {
                version: '2',
            },
        };
    }
    getUserElement( /* user: USyncUser */) {



        return null;
    }
    parser(node) {
        const deviceList = [];
        let keyIndex = undefined;
        if (node.tag === 'devices') {
            (0, WABinary_1.assertNodeErrorFree)(node);
            const deviceListNode = (0, WABinary_1.getBinaryNodeChild)(node, 'device-list');
            const keyIndexNode = (0, WABinary_1.getBinaryNodeChild)(node, 'key-index-list');
            if (Array.isArray(deviceListNode === null || deviceListNode === void 0 ? void 0 : deviceListNode.content)) {
                for (const { tag, attrs } of deviceListNode.content) {
                    const id = +attrs.id;
                    const keyIndex = +attrs['key-index'];
                    if (tag === 'device') {
                        deviceList.push({
                            id,
                            keyIndex,
                            isHosted: !!(attrs['is_hosted'] && attrs['is_hosted'] === 'true')
                        });
                    }
                }
            }
            if ((keyIndexNode === null || keyIndexNode === void 0 ? void 0 : keyIndexNode.tag) === 'key-index-list') {
                keyIndex = {
                    timestamp: +keyIndexNode.attrs['ts'],
                    signedKeyIndex: keyIndexNode === null || keyIndexNode === void 0 ? void 0 : keyIndexNode.content,
                    expectedTimestamp: keyIndexNode.attrs['expected_ts'] ? +keyIndexNode.attrs['expected_ts'] : undefined
                };
            }
        }
        return {
            deviceList,
            keyIndex
        };
    }
}
exports.USyncDeviceProtocol = USyncDeviceProtocol;
