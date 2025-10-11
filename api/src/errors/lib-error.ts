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