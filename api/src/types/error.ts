import { HTTPException } from "hono/http-exception";

// Client errors
export class UserInactiveError extends HTTPException{
    constructor(){
        super(403, { message: 'User is currently disabled.' })
    }
}

export class MissingMailError extends HTTPException{
    constructor(){
        super(400, { message: 'Mail address is missing in authorizaton header.' })
    }
}

export class MissingParameter extends HTTPException{
    constructor(paramName: string){
        super(400, { message: `Request parameter '${paramName}' missing` })
    }
}

export class InvalidParameter extends HTTPException{
    constructor(paramName: string){
        super(400, { message: `Provided parameter '${paramName}' is invalid.` })
    }
}

// Server side errors
export class DatabaseError extends HTTPException{
    constructor(){
        super(500, { message: 'Internal Database Error' })
    }
}