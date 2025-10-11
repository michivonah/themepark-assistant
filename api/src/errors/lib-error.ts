// Errors in custom libs
import { BaseError } from "./base-error";

export class LibError extends BaseError{}

export class FetchError extends LibError{
    constructor(cause?: unknown, source?: string){
        super(
            source
            ? `Fetching data from ${source} failed`
            : 'Fetching data failed',
            cause);
    }
}

export class BatchExecutionError extends LibError{
    constructor(cause?: unknown){
        super('Batched execution failed.', cause);
    }
}

export class HTTPError extends LibError{
    constructor(errorCode: number, cause?: unknown){
        super(`Received HTTP error code: ${errorCode}`, cause);
    }
}