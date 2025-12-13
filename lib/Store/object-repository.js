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
exports.ObjectRepository = void 0;
class ObjectRepository {
    constructor(entities = {}) {
        this.entityMap = new Map(Object.entries(entities));
    }
    findById(id) {
        return this.entityMap.get(id);
    }
    findAll() {
        return Array.from(this.entityMap.values());
    }
    upsertById(id, entity) {
        return this.entityMap.set(id, { ...entity });
    }
    deleteById(id) {
        return this.entityMap.delete(id);
    }
    count() {
        return this.entityMap.size;
    }
    toJSON() {
        return this.findAll();
    }
}
exports.ObjectRepository = ObjectRepository;
