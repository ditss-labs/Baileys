export const __esModule: boolean;
export default processMessage;
/**
 * Decrypt a poll vote
 * @param vote encrypted vote
 * @param ctx additional info about the poll required for decryption
 * @returns list of SHA256 options
 */
export function decryptPollVote({ encPayload, encIv }: {
    encPayload: any;
    encIv: any;
}, { pollCreatorJid, pollMsgId, pollEncKey, voterJid, }: {
    pollCreatorJid: any;
    pollMsgId: any;
    pollEncKey: any;
    voterJid: any;
}): any;
/** Cleans a received message to further processing */
export function cleanMessage(message: any, meId: any): void;
export function isRealMessage(message: any, meId: any): boolean;
export function shouldIncrementChatUnread(message: any): boolean;
/**
 * Get the ID of the chat from the given key.
 * Typically -- that'll be the remoteJid, but for broadcasts, it'll be the participant
 */
export function getChatId({ remoteJid, participant, fromMe }: {
    remoteJid: any;
    participant: any;
    fromMe: any;
}): any;
declare function processMessage(message: any, { shouldProcessHistoryMsg, placeholderResendCache, ev, creds, keyStore, logger, options, getMessage }: {
    shouldProcessHistoryMsg: any;
    placeholderResendCache: any;
    ev: any;
    creds: any;
    keyStore: any;
    logger: any;
    options: any;
    getMessage: any;
}): Promise<void>;
