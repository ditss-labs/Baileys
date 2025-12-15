import PQueue from 'p-queue';
import { SignalDataSet, SignalDataTypeMap, SignalKeyStore } from '../Types';
import { ILogger } from './logger';
export declare class PreKeyManager {
    private readonly store;
    private readonly logger;
    private readonly queues;
    constructor(store: SignalKeyStore, logger: ILogger);
    private getQueue;
    processOperations(data: SignalDataSet, keyType: keyof SignalDataTypeMap, transactionCache: SignalDataSet, mutations: SignalDataSet, isInTransaction: boolean): Promise<void>;
    private processDeletions;
    validateDeletions(data: SignalDataSet, keyType: keyof SignalDataTypeMap): Promise<void>;
}
