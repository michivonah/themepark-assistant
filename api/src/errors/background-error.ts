// Error classes for background jobs
import { BaseError } from "./base-error";

// Class for custom background errors
export class BackgroundJobError extends BaseError{}

// Errors based on class BackgroundJobError
export class BackgroundDatabaseError extends BackgroundJobError{
    constructor(cause?: unknown){
        super('Database request failed.', cause);
    }
}

export class AttractionImportError extends BackgroundJobError{
    constructor(cause?: unknown){
        super('Failed to import attractions into database.', cause);
    }
}

export class ThemeparkUpdateError extends BackgroundJobError{
    constructor(cause?: unknown){
        super('Failed to update themepark data.', cause);
    }
}

export class KVParseError extends BackgroundJobError{
    constructor(key: string, cause?: unknown){
        super(`Failed to parse JSON from KV, affected key: ${key}`, cause);
    }
}

export class SendNotificationError extends BackgroundJobError{
    constructor(cause?: unknown){
        super('Failed to send notification.', cause);
    }
}