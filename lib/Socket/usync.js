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
exports.makeUSyncSocket = void 0;
const boom_1 = require("@hapi/boom");
const WABinary_1 = require("../WABinary");
const socket_1 = require("./socket");
const makeUSyncSocket = (config) => {
    const sock = (0, socket_1.makeSocket)(config);
    const { generateMessageTag, query, } = sock;
    const executeUSyncQuery = async (usyncQuery) => {
        if (usyncQuery.protocols.length === 0) {
            throw new boom_1.Boom('USyncQuery must have at least one protocol');
        }


        const validUsers = usyncQuery.users;
        const userNodes = validUsers.map((user) => {
            return {
                tag: 'user',
                attrs: {
                    jid: !user.phone ? user.id : undefined,
                },
                content: usyncQuery.protocols
                    .map((a) => a.getUserElement(user))
                    .filter(a => a !== null)
            };
        });
        const listNode = {
            tag: 'list',
            attrs: {},
            content: userNodes
        };
        const queryNode = {
            tag: 'query',
            attrs: {},
            content: usyncQuery.protocols.map((a) => a.getQueryElement())
        };
        const iq = {
            tag: 'iq',
            attrs: {
                to: WABinary_1.S_WHATSAPP_NET,
                type: 'get',
                xmlns: 'usync',
            },
            content: [
                {
                    tag: 'usync',
                    attrs: {
                        context: usyncQuery.context,
                        mode: usyncQuery.mode,
                        sid: generateMessageTag(),
                        last: 'true',
                        index: '0',
                    },
                    content: [
                        queryNode,
                        listNode
                    ]
                }
            ],
        };
        const result = await query(iq);
        return usyncQuery.parseUSyncQueryResult(result);
    };
    return {
        ...sock,
        executeUSyncQuery,
    };
};
exports.makeUSyncSocket = makeUSyncSocket;
