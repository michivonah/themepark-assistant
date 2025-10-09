export class Message<T = {}>{
    message: string;
    details?: T;
    detailsInline?: boolean;

    constructor(message: string, details?: T, detailsInline: boolean = false){
        this.message = message;
        if(details) detailsInline ? Object.assign(this, details) : this.details = details;
    }
}