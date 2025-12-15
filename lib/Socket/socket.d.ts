export const __esModule: boolean;
/**
 * Connects to WA servers and performs:
 * - simple queries (no retry mechanism, wait for connection establishment)
 * - listen to messages and emit events
 * - query phone connection
 */
export function makeSocket(config: any): {
    type: string;
    ws: any;
    ev: any;
    authState: {
        creds: any;
        keys: any;
    };
    signalRepository: any;
    readonly user: any;
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
    /** Waits for the connection to WA to reach a state */
    waitForConnectionUpdate: any;
    sendWAMBuffer: (wamBuffer: any) => Promise<any>;
};
