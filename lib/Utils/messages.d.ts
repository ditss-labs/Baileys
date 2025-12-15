export const __esModule: boolean;
/**
 * Aggregates all poll updates in a poll.
 * @param msg the poll creation message
 * @param meId your jid
 * @returns A list of options & their voters
 */
export function getAggregateVotesInPollMessage({ message, pollUpdates }: {
    message: any;
    pollUpdates: any;
}, meId: any): any[];
/**
 * Uses a regex to test whether the string contains a URL, and returns the URL if it does.
 * @param text eg. hello https://google.com
 * @returns the URL, eg. https://google.com
 */
export function extractUrlFromText(text: any): any;
export function generateLinkPreviewIfRequired(text: any, getUrlInfo: any, logger: any): Promise<any>;
export function prepareWAMessageMedia(message: any, options: any): Promise<any>;
export function prepareDisappearingMessageSettingContent(ephemeralExpiration: any): any;
/**
 * Generate forwarded message content like WA does
 * @param message the message to forward
 * @param options.forceForward will show the message as forwarded even if it is from you
 */
export function generateForwardMessageContent(message: any, forceForward: any): any;
export function generateWAMessageContent(message: any, options: any): Promise<any>;
export function generateWAMessageFromContent(jid: any, message: any, options: any): any;
export function generateWAMessage(jid: any, content: any, options: any): Promise<any>;
/** Get the key to access the true type of content */
export function getContentType(content: any): string;
/**
 * Normalizes ephemeral, view once messages to regular message content
 * Eg. image messages in ephemeral messages, in view once messages etc.
 * @param content
 * @returns
 */
export function normalizeMessageContent(content: any): any;
/**
 * Extract the true message content from a message
 * Eg. extracts the inner message from a disappearing message/view once message
 */
export function extractMessageContent(content: any): any;
/**
 * Returns the device predicted by message ID
 */
export function getDevice(id: any): "web" | "unknown" | "android" | "ios" | "desktop";
/** Upserts a receipt in the message */
export function updateMessageWithReceipt(msg: any, receipt: any): void;
/** Update the message with a new reaction */
export function updateMessageWithReaction(msg: any, reaction: any): void;
/** Update the message with a new poll update */
export function updateMessageWithPollUpdate(msg: any, update: any): void;
/** Given a list of message keys, aggregates them by chat & sender. Useful for sending read receipts in bulk */
export function aggregateMessageKeysNotFromMe(keys: any): any[];
/**
 * Downloads the given message. Throws an error if it's not a media message
 */
export function downloadMediaMessage(message: any, type: any, options: any, ctx: any): Promise<any>;
/** Checks whether the given message is a media message; if it is returns the inner content */
export function assertMediaContent(content: any): any;
export function toJid(id: any): any;
export function getSenderLid(message: any): {
    jid: any;
    lid: any;
};
