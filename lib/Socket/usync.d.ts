export const __esModule: boolean;
export function makeUSyncSocket(config: any): {
    executeUSyncQuery: (usyncQuery: any) => Promise<any>;
    type: string;
    ws: any;
    ev: any;
    authState: {
        creds: any;
        keys: any;
    };
    signalRepository: any;
    user: any;
    generateMessageTag: () => string;
    query: (node: any, timeoutMs: any) => Promise<any>;
    waitForMessage: (msgId: any, timeoutMs?: any) => Promise<any>;
    waitForSocketOpen: () => Promise<void>;
    sendRawMessage: (data: any) => Promise<void>;
    sendNode: (frame: any) => Promise<void>;
    logout: (msg: any) => Promise<void>;
    end: (error: any) => void;
    onUnexpectedError: (err: any, msg: any) => void;
    uploadPreKeys: (count?: 812) => Promise<void>;
    uploadPreKeysToServerIfRequired: () => Promise<void>;
    requestPairingCode: (phoneNumber: any, pairCode?: string) => Promise<any>;
    waitForConnectionUpdate: any;
    sendWAMBuffer: (wamBuffer: any) => Promise<any>;
};
