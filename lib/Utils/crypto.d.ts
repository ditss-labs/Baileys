export const __esModule: boolean;
export namespace Curve {
    function generateKeyPair(): {
        private: Buffer<any>;
        public: Buffer<any>;
    };
    function sharedKey(privateKey: any, publicKey: any): Buffer<any>;
    function sign(privateKey: any, buf: any): any;
    function verify(pubKey: any, message: any, signature: any): boolean;
}
/**
 * encrypt AES 256 GCM;
 * where the tag tag is suffixed to the ciphertext
 * */
export function aesEncryptGCM(plaintext: any, key: any, iv: any, additionalData: any): Buffer<ArrayBuffer>;
/**
 * decrypt AES 256 GCM;
 * where the auth tag is suffixed to the ciphertext
 * */
export function aesDecryptGCM(ciphertext: any, key: any, iv: any, additionalData: any): Buffer<ArrayBuffer>;
export function aesEncryptCTR(plaintext: any, key: any, iv: any): Buffer<ArrayBuffer>;
export function aesDecryptCTR(ciphertext: any, key: any, iv: any): Buffer<ArrayBuffer>;
/** decrypt AES 256 CBC; where the IV is prefixed to the buffer */
export function aesDecrypt(buffer: any, key: any): Buffer<ArrayBuffer>;
/** decrypt AES 256 CBC */
export function aesDecryptWithIV(buffer: any, key: any, IV: any): Buffer<ArrayBuffer>;
export function aesEncrypt(buffer: any, key: any): Buffer<ArrayBuffer>;
export function aesEncrypWithIV(buffer: any, key: any, IV: any): Buffer<ArrayBuffer>;
export function hmacSign(buffer: any, key: any, variant?: string): Buffer<ArrayBufferLike>;
export function sha256(buffer: any): Buffer<ArrayBufferLike>;
export function md5(buffer: any): Buffer<ArrayBufferLike>;
export function hkdf(buffer: any, expandedLength: any, info: any): Promise<Buffer<any>>;
export function derivePairingCodeKey(pairingCode: any, salt: any): Promise<Buffer<any>>;
/** prefix version byte to the pub keys, required for some curve crypto functions */
export function generateSignalPubKey(pubKey: any): any;
export function signedKeyPair(identityKeyPair: any, keyId: any): {
    keyPair: {
        private: Buffer<any>;
        public: Buffer<any>;
    };
    signature: any;
    keyId: any;
};
