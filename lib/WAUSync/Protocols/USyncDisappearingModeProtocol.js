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
exports.USyncDisappearingModeProtocol = void 0;
const WABinary_1 = require("../../WABinary");
class USyncDisappearingModeProtocol {
    constructor() {
        this.name = 'disappearing_mode';
    }
    getQueryElement() {
        return {
            tag: 'disappearing_mode',
            attrs: {},
        };
    }
    getUserElement() {
        return null;
    }
    parser(node) {
        if (node.tag === 'disappearing_mode') {
            (0, WABinary_1.assertNodeErrorFree)(node);
            const duration = +(node === null || node === void 0 ? void 0 : node.attrs.duration);
            const setAt = new Date(+((node === null || node === void 0 ? void 0 : node.attrs.t) || 0) * 1000);
            return {
                duration,
                setAt,
            };
        }
    }
}
exports.USyncDisappearingModeProtocol = USyncDisappearingModeProtocol;
