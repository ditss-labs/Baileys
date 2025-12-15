export const __esModule: boolean;
export class SenderMessageKey {
    constructor(iteration: any, seed: any);
    iv: Buffer<ArrayBuffer>;
    cipherKey: Buffer<ArrayBufferLike>;
    iteration: any;
    seed: any;
    getIteration(): any;
    getIv(): Buffer<ArrayBuffer>;
    getCipherKey(): Buffer<ArrayBufferLike>;
    getSeed(): any;
}
