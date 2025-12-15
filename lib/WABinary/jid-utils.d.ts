export const __esModule: boolean;
export const S_WHATSAPP_NET: "@s.whatsapp.net";
export const OFFICIAL_BIZ_JID: "16505361212@c.us";
export const SERVER_JID: "server@c.us";
export const PSA_WID: "0@c.us";
export const STORIES_JID: "status@broadcast";
export const META_AI_JID: "13135550002@c.us";
export function jidEncode(user: any, server: any, device: any, agent: any): string;
export function jidDecode(jid: any): {
    server: any;
    user: any;
    domainType: number;
    device: number;
};
/** is the jid a user */
export function areJidsSameUser(jid1: any, jid2: any): boolean;
/** is the jid Meta IA */
export function isJidMetaAi(jid: any): any;
/** is the jid a user */
export function isJidUser(jid: any): any;
/** is the jid a group */
export function isLidUser(jid: any): any;
/** is the jid a broadcast */
export function isJidBroadcast(jid: any): any;
/** is the jid a newsletter */
export function isJidNewsletter(jid: any): any;
/** is the jid a group */
export function isJidGroup(jid: any): any;
/** is the jid the status broadcast */
export function isJidStatusBroadcast(jid: any): boolean;
export function isJidBot(jid: any): any;
export function jidNormalizedUser(jid: any): string;
export function lidToJid(jid: any): any;
export function getBotJid(jid: any): any;
