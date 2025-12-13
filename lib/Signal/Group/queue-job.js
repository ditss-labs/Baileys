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
exports.default = queueJob;
const _queueAsyncBuckets = new Map();
const _gcLimit = 10000;
async function _asyncQueueExecutor(queue, cleanup) {
    let offt = 0;

    while (true) {
        const limit = Math.min(queue.length, _gcLimit);
        for (let i = offt; i < limit; i++) {
            const job = queue[i];
            try {
                job.resolve(await job.awaitable());
            }
            catch (e) {
                job.reject(e);
            }
        }
        if (limit < queue.length) {
            if (limit >= _gcLimit) {
                queue.splice(0, limit);
                offt = 0;
            }
            else {
                offt = limit;
            }
        }
        else {
            break;
        }
    }
    cleanup();
}
function queueJob(bucket, awaitable) {

    if (typeof bucket !== 'string') {
        console.warn('Unhandled bucket type (for naming):', typeof bucket, bucket);
    }
    let inactive = false;
    if (!_queueAsyncBuckets.has(bucket)) {
        _queueAsyncBuckets.set(bucket, []);
        inactive = true;
    }
    const queue = _queueAsyncBuckets.get(bucket);
    const job = new Promise((resolve, reject) => {
        queue.push({
            awaitable,
            resolve: resolve,
            reject
        });
    });
    if (inactive) {
        _asyncQueueExecutor(queue, () => _queueAsyncBuckets.delete(bucket));
    }
    return job;
}
