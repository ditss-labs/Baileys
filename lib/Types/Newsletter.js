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
exports.XWAPaths = exports.MexOperations = void 0;
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
    XWAPaths["METADATA_UPDATE"] = "xwa2_notify_newsletter_on_metadata_update";
})(XWAPaths || (exports.XWAPaths = XWAPaths = {}));
