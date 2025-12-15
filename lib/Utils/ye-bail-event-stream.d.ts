export const __esModule: boolean;
/**
 * Captures events from a ye-bail event emitter & stores them in a file
 * @param ev The event emitter to read events from
 * @param filename File to save to
 */
export function captureEventStream(ev: any, filename: any): void;
/**
 * Read event file and emit events from there
 * @param filename filename containing event data
 * @param delayIntervalMs delay between each event emit
 */
export function readAndEmitEventStream(filename: any, delayIntervalMs?: number): {
    ev: any;
    task: Promise<void>;
};
