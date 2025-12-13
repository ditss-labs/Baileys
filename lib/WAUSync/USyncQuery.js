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
exports.USyncQuery = void 0;
const WABinary_1 = require("../WABinary");
const UsyncBotProfileProtocol_1 = require("./Protocols/UsyncBotProfileProtocol");
const UsyncLIDProtocol_1 = require("./Protocols/UsyncLIDProtocol");
const Protocols_1 = require("./Protocols");
class USyncQuery {
    constructor() {
        this.protocols = [];
        this.users = [];
        this.context = 'interactive';
        this.mode = 'query';
    }
    withMode(mode) {
        this.mode = mode;
        return this;
    }
    withContext(context) {
        this.context = context;
        return this;
    }
    withUser(user) {
        this.users.push(user);
        return this;
    }
    parseUSyncQueryResult(result) {
        if (result.attrs.type !== 'result') {
            return;
        }
        const protocolMap = Object.fromEntries(this.protocols.map((protocol) => {
            return [protocol.name, protocol.parser];
        }));
        const queryResult = {

            list: [],
            sideList: [],
        };
        const usyncNode = (0, WABinary_1.getBinaryNodeChild)(result, 'usync');



        const listNode = (0, WABinary_1.getBinaryNodeChild)(usyncNode, 'list');
        if (Array.isArray(listNode === null || listNode === void 0 ? void 0 : listNode.content) && typeof listNode !== 'undefined') {
            queryResult.list = listNode.content.map((node) => {
                const id = node === null || node === void 0 ? void 0 : node.attrs.jid;
                const data = Array.isArray(node === null || node === void 0 ? void 0 : node.content) ? Object.fromEntries(node.content.map((content) => {
                    const protocol = content.tag;
                    const parser = protocolMap[protocol];
                    if (parser) {
                        return [protocol, parser(content)];
                    }
                    else {
                        return [protocol, null];
                    }
                }).filter(([, b]) => b !== null)) : {};
                return { ...data, id };
            });
        }


        return queryResult;
    }
    withDeviceProtocol() {
        this.protocols.push(new Protocols_1.USyncDeviceProtocol());
        return this;
    }
    withContactProtocol() {
        this.protocols.push(new Protocols_1.USyncContactProtocol());
        return this;
    }
    withStatusProtocol() {
        this.protocols.push(new Protocols_1.USyncStatusProtocol());
        return this;
    }
    withDisappearingModeProtocol() {
        this.protocols.push(new Protocols_1.USyncDisappearingModeProtocol());
        return this;
    }
    withBotProfileProtocol() {
        this.protocols.push(new UsyncBotProfileProtocol_1.USyncBotProfileProtocol());
        return this;
    }
    withLIDProtocol() {
        this.protocols.push(new UsyncLIDProtocol_1.USyncLIDProtocol());
        return this;
    }
}
exports.USyncQuery = USyncQuery;
