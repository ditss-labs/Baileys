export const __esModule: boolean;
export namespace waLabelAssociationKey {
    function key(la: any): any;
    function compare(k1: any, k2: any): any;
}
declare function _default(config: any): {
    chats: import("@adiwajshing/keyed-db").default<any, any>;
    contacts: {};
    messages: {};
    groupMetadata: {};
    state: {
        connection: string;
    };
    presences: {};
    labels: object_repository_1.ObjectRepository;
    labelAssociations: import("@adiwajshing/keyed-db").default<any, any>;
    bind: (ev: any) => void;
    /** loads messages from the store, if not found -- uses the legacy connection */
    loadMessages: (jid: any, count: any, cursor: any) => Promise<any>;
    /**
     * Get all available labels for profile
     *
     * Keep in mind that the list is formed from predefined tags and tags
     * that were "caught" during their editing.
     */
    getLabels: () => object_repository_1.ObjectRepository;
    /**
     * Get labels for chat
     *
     * @returns Label IDs
     **/
    getChatLabels: (chatId: any) => any[];
    /**
     * Get labels for message
     *
     * @returns Label IDs
     **/
    getMessageLabels: (messageId: any) => any[];
    loadMessage: (jid: any, id: any) => Promise<any>;
    mostRecentMessage: (jid: any) => Promise<any>;
    fetchImageUrl: (jid: any, sock: any) => Promise<any>;
    fetchGroupMetadata: (jid: any, sock: any) => Promise<any>;
    fetchMessageReceipts: ({ remoteJid, id }: {
        remoteJid: any;
        id: any;
    }) => Promise<any>;
    toJSON: () => {
        chats: import("@adiwajshing/keyed-db").default<any, any>;
        contacts: {};
        messages: {};
        labels: object_repository_1.ObjectRepository;
        labelAssociations: import("@adiwajshing/keyed-db").default<any, any>;
    };
    fromJSON: (json: any) => void;
    writeToFile: (path: any) => void;
    readFromFile: (path: any) => void;
};
export default _default;
export function waChatKey(pin: any): {
    key: (c: any) => string;
    compare: (k1: any, k2: any) => any;
};
export function waMessageID(m: any): any;
import object_repository_1 = require("./object-repository");
