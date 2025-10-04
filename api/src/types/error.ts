import { HTTPException } from "hono/http-exception";

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