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
exports.USyncContactProtocol = void 0;
const WABinary_1 = require("../../WABinary");
class USyncContactProtocol {
    constructor() {
        this.name = 'contact';
    }
    getQueryElement() {
        return {
            tag: 'contact',
            attrs: {},
        };
    }
    getUserElement(user) {

        return {
            tag: 'contact',
            attrs: {},
            content: user.phone,
        };
    }
    parser(node) {
        var _a;
        if (node.tag === 'contact') {
            (0, WABinary_1.assertNodeErrorFree)(node);
            return ((_a = node === null || node === void 0 ? void 0 : node.attrs) === null || _a === void 0 ? void 0 : _a.type) === 'in';
        }
        return false;
    }
}
exports.USyncContactProtocol = USyncContactProtocol;
