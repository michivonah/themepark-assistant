// Base for new error domains/classes
export class BaseError extends Error{
    cause?: unknown;

    constructor(message: string, cause?: unknown){
        super(message);
        this.name = this.constructor.name;
        this.cause = cause;
    }
}