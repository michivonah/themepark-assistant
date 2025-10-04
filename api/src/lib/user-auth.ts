import { getDbContext } from "../db/client";
import { Context } from "hono";
import { UserSelect } from "../types/user";
import { user } from "../db/schema";
import { like } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { MissingMailError, UserInactiveError, DatabaseError } from "../types/error";

/**
 * Returns the details of a user from the given context
 * @param c Request context
 * @returns Object of the user details as type UserSelect
 */
export async function getUser(c: Context): Promise<UserSelect>{
    const db = getDbContext(c);
    const auth = c.get('authUser');
    if(!auth.session.user || !auth.session.user.email) throw new MissingMailError();

    const currentUser: UserSelect = c.get('currentUser');
    if(currentUser) return currentUser;

    const mail = auth.session.user.email;

    let userData: UserSelect[];
    try{
        userData = await db.selectDistinct().from(user).limit(1).where(like(user.mail, mail));

    }
    catch(e){
        throw new DatabaseError();
    }

    const dbResult = userData[0] ?? await createUser(db, mail);
    if(!dbResult.isActive) throw new UserInactiveError();

    c.set('currentUser', dbResult);
    return dbResult;
}

/**
 * Creates a new user in the DB from the given context
 * @param c Request context
 * @returns The created user as Object of type UserSelect
 */
async function createUser(db: DrizzleD1Database, userMail: string): Promise<UserSelect>{
    let userData: UserSelect[];

    try{
        userData = await db.insert(user).values(
            {
                mail: userMail,
                isActive: true,
                createdAt: now(),
                lastActive: now()
            }
        ).returning();

    }
    catch(e){
        throw new DatabaseError();
    }

    return userData[0];
}

/**
 * Getting the current time
 * @returns Current unix timestamp
 */
const now = () => Math.floor(Date.now() / 1000);
