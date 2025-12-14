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
exports.QueryIds = exports.XWAPaths = exports.MexOperations = void 0;
var MexOperations;
(function (MexOperations) {
    MexOperations["PROMOTE"] = "NotificationNewsletterAdminPromote";
    MexOperations["DEMOTE"] = "NotificationNewsletterAdminDemote";
    MexOperations["UPDATE"] = "NotificationNewsletterUpdate";
})(MexOperations || (exports.MexOperations = MexOperations = {}));
var XWAPaths;
(function (XWAPaths) {
    XWAPaths["PROMOTE"] = "xwa2_notify_newsletter_admin_promote";
    XWAPaths["DEMOTE"] = "xwa2_notify_newsletter_admin_demote";
    XWAPaths["ADMIN_COUNT"] = "xwa2_newsletter_admin";
    XWAPaths["CREATE"] = "xwa2_newsletter_create";
    XWAPaths["NEWSLETTER"] = "xwa2_newsletter";
    XWAPaths["SUBSCRIBED"] = "xwa2_newsletter_subscribed";
    XWAPaths["METADATA_UPDATE"] = "xwa2_notify_newsletter_on_metadata_update";
})(XWAPaths || (exports.XWAPaths = XWAPaths = {}));
var QueryIds;
(function (QueryIds) {
    QueryIds["JOB_MUTATION"] = "7150902998257522";
    QueryIds["METADATA"] = "6620195908089573";
    QueryIds["UNFOLLOW"] = "7238632346214362";
    QueryIds["FOLLOW"] = "7871414976211147";
    QueryIds["UNMUTE"] = "7337137176362961";
    QueryIds["MUTE"] = "25151904754424642";
    QueryIds["CREATE"] = "6996806640408138";
    QueryIds["ADMIN_COUNT"] = "7130823597031706";
    QueryIds["CHANGE_OWNER"] = "7341777602580933";
    QueryIds["DELETE"] = "8316537688363079";
    QueryIds["DEMOTE"] = "6551828931592903";
    QueryIds["PROMOTE"] = "6551828931592903";
    QueryIds["SUBSCRIBERS"] = "9783111038412085";
    QueryIds["SUBSCRIBED"] = "6388546374527196";
})(QueryIds || (exports.QueryIds = QueryIds = {}));
