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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAuthCreds = exports.addTransactionCapability = void 0;
exports.makeCacheableSignalKeyStore = makeCacheableSignalKeyStore;
const crypto_1 = require("crypto");
const async_hooks_1 = require("async_hooks");
const async_mutex_1 = require("async-mutex");
const p_queue_1 = __importDefault(require("p-queue"));
const node_cache_1 = __importDefault(require("@cacheable/node-cache"));
const Defaults_1 = require("../Defaults");
const crypto_2 = require("./crypto");
const generics_1 = require("./generics");
const pre_key_manager_1 = require("./pre-key-manager");
/**
 * Adds caching capability to a SignalKeyStore
 * @param store the store to add caching to
 * @param logger to log trace events
 * @param _cache cache store to use
 */
function makeCacheableSignalKeyStore(store, logger, _cache) {
    const cache = _cache || new node_cache_1.default({
        stdTTL: Defaults_1.DEFAULT_CACHE_TTLS.SIGNAL_STORE,
        useClones: false,
        deleteOnExpire: true,
    });
    function getUniqueId(type, id) {
        return `${type}.${id}`;
    }
    return {
        async get(type, ids) {
            const data = {};
            const idsToFetch = [];
            for (const id of ids) {
                const item = cache.get(getUniqueId(type, id));
                if (typeof item !== 'undefined') {
                    data[id] = item;
                }
                else {
                    idsToFetch.push(id);
                }
            }
            if (idsToFetch.length) {
                logger === null || logger === void 0 ? void 0 : logger.trace({ items: idsToFetch.length }, 'loading from store');
                const fetched = await store.get(type, idsToFetch);
                for (const id of idsToFetch) {
                    const item = fetched[id];
                    if (item) {
                        data[id] = item;
                        cache.set(getUniqueId(type, id), item);
                    }
                }
            }
            return data;
        },
        async set(data) {
            let keys = 0;
            for (const type in data) {
                for (const id in data[type]) {
                    cache.set(getUniqueId(type, id), data[type][id]);
                    keys += 1;
                }
            }
            logger === null || logger === void 0 ? void 0 : logger.trace({ keys }, 'updated cache');
            await store.set(data);
        },
        async clear() {
            var _a;
            cache.flushAll();
            await ((_a = store.clear) === null || _a === void 0 ? void 0 : _a.call(store));
        }
    };
}
const addTransactionCapability = (state, logger, { maxCommitRetries, delayBetweenTriesMs }) => {
    const txStorage = new async_hooks_1.AsyncLocalStorage();
    const keyQueues = new Map();
    const txMutexes = new Map();
    const preKeyManager = new pre_key_manager_1.PreKeyManager(state, logger);
    function getQueue(key) {
        if (!keyQueues.has(key)) {
            keyQueues.set(key, new p_queue_1.default({ concurrency: 1 }));
        }
        return keyQueues.get(key);
    }
    function getTxMutex(key) {
        if (!txMutexes.has(key)) {
            txMutexes.set(key, new async_mutex_1.Mutex());
        }
        return txMutexes.get(key);
    }
    function isInTransaction() {
        return !!txStorage.getStore();
    }
    async function commitWithRetry(mutationSet) {
        if (Object.keys(mutationSet).length === 0) {
            logger === null || logger === void 0 ? void 0 : logger.trace('no mutations in transaction');
            return;
        }
        logger === null || logger === void 0 ? void 0 : logger.trace('committing transaction');
        for (let attempt = 0; attempt < maxCommitRetries; attempt++) {
            try {
                await state.set(mutationSet);
                logger === null || logger === void 0 ? void 0 : logger.trace({ mutationCount: Object.keys(mutationSet).length }, 'committed transaction');
                return;
            }
            catch (error) {
                const retriesLeft = maxCommitRetries - attempt - 1;
                logger === null || logger === void 0 ? void 0 : logger.warn(`failed to commit mutations, retries left=${retriesLeft}`);
                if (retriesLeft === 0) {
                    throw error;
                }
                await (0, generics_1.delay)(delayBetweenTriesMs);
            }
        }
    }
    return {
        get: async (type, ids) => {
            const ctx = txStorage.getStore();
            if (!ctx) {
                return state.get(type, ids);
            }
            const cached = ctx.cache[type] || {};
            const missing = ids.filter(id => !(id in cached));
            if (missing.length > 0) {
                ctx.dbQueries += 1;
                logger === null || logger === void 0 ? void 0 : logger.trace({ type, count: missing.length }, 'fetching missing keys in transaction');
                const fetched = await getTxMutex(type).runExclusive(() => state.get(type, missing));
                ctx.cache[type] = ctx.cache[type] || {};
                Object.assign(ctx.cache[type], fetched);
            }
            const result = {};
            for (const id of ids) {
                var _a;
                const value = (_a = ctx.cache[type]) === null || _a === void 0 ? void 0 : _a[id];
                if (value !== undefined && value !== null) {
                    result[id] = value;
                }
            }
            return result;
        },
        set: async data => {
            const ctx = txStorage.getStore();
            if (!ctx) {
                const types = Object.keys(data);
                for (const type of types) {
                    if (type === 'pre-key') {
                        await preKeyManager.validateDeletions(data, type);
                    }
                }
                await Promise.all(types.map(type => getQueue(type).add(async () => {
                    const typeData = { [type]: data[type] };
                    await state.set(typeData);
                })));
                return;
            }
            logger === null || logger === void 0 ? void 0 : logger.trace({ types: Object.keys(data) }, 'caching in transaction');
            for (const key in data) {
                ctx.cache[key] = ctx.cache[key] || {};
                ctx.mutations[key] = ctx.mutations[key] || {};
                if (key === 'pre-key') {
                    await preKeyManager.processOperations(data, key, ctx.cache, ctx.mutations, true);
                }
                else {
                    Object.assign(ctx.cache[key], data[key]);
                    Object.assign(ctx.mutations[key], data[key]);
                }
            }
        },
        isInTransaction,
        transaction: async (work, key) => {
            const existing = txStorage.getStore();
            if (existing) {
                logger === null || logger === void 0 ? void 0 : logger.trace('reusing existing transaction context');
                return work();
            }
            return getTxMutex(key).runExclusive(async () => {
                const ctx = {
                    cache: {},
                    mutations: {},
                    dbQueries: 0
                };
                logger === null || logger === void 0 ? void 0 : logger.trace('entering transaction');
                try {
                    const result = await txStorage.run(ctx, work);
                    await commitWithRetry(ctx.mutations);
                    logger === null || logger === void 0 ? void 0 : logger.trace({ dbQueries: ctx.dbQueries }, 'transaction completed');
                    return result;
                }
                catch (error) {
                    logger === null || logger === void 0 ? void 0 : logger.error({ error }, 'transaction failed, rolling back');
                    throw error;
                }
            });
        }
    };
};
exports.addTransactionCapability = addTransactionCapability;
const initAuthCreds = () => {
    const identityKey = crypto_2.Curve.generateKeyPair();
    return {
        noiseKey: crypto_2.Curve.generateKeyPair(),
        pairingEphemeralKeyPair: crypto_2.Curve.generateKeyPair(),
        signedIdentityKey: identityKey,
        signedPreKey: (0, crypto_2.signedKeyPair)(identityKey, 1),
        registrationId: (0, generics_1.generateRegistrationId)(),
        advSecretKey: (0, crypto_1.randomBytes)(32).toString('base64'),
        processedHistoryMessages: [],
        nextPreKeyId: 1,
        firstUnuploadedPreKeyId: 1,
        accountSyncCounter: 0,
        accountSettings: {
            unarchiveChats: false
        },
        registered: false,
        pairingCode: undefined,
        lastPropHash: undefined,
        routingInfo: undefined,
    };
};
exports.initAuthCreds = initAuthCreds;
