import { BatchExecutionError } from "../errors";

/**
 * Run any async operation in (multiple) batches
 * @param data Array to split into batches
 * @param batchSize Amount of items per batch (default: 20)
 * @param callback Async function to execute for each batch
 */
export default async function asyncBatchJob<T>(data: T[], batchSize: number = 20, callback: (batch: T[], batchIndex: number) => Promise<void>): Promise<void>{
    try{
        for (let i = 0; i < data.length; i += batchSize){
            const batch = data.slice(i, i + batchSize);
            await callback(batch, i / batchSize);
        }
    }
    catch(e){
        throw new BatchExecutionError(e);
    }
}