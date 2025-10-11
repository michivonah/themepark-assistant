import { Hono, Context } from 'hono'
import { getDbContext } from '../db/client'
import { attractionNotification, notificationMethod } from '../db/schema'
import { and, eq } from 'drizzle-orm'
import { DatabaseError, InvalidParameter, MissingParameter } from '../errors/http-error'
import { getUser } from '../lib/user-auth'
import { Message } from '../types/response'
import { NotificationMethodSelect } from '../types/notification-method'

type NotificationMethodUser = Pick<NotificationMethodSelect, "userId">;

const app = new Hono()

/**
 * Checks if request has notificationMethodId parameter
 * @param c Request context
 * @returns if available notificationMethodId, else undefined
 */
function getNotificationMethodId(c: Context): number | undefined{
    const str = c.req.query('notificationMethodId');
    if(!str) return undefined;
    return parseInt(str);
}

/**
 * Checks if a specified user is the owner of a notification method and returns the owner if valid
 * @param db DB connection (already defined as variable/const)
 * @param methodId notificationMethodId to check
 * @param userId User to check wheter it is the owner
 * @returns Object with the owners userId
 */
async function getNotificationMethodOwner(db: ReturnType<typeof getDbContext>, methodId: number, userId: number): Promise<NotificationMethodUser>{
    try{
        const method = await db.select({
            userId: notificationMethod.userId
        }).from(notificationMethod)
        .where(eq(notificationMethod.id, methodId)).get();
        
        if(!method || method.userId !== userId) throw new InvalidParameter('notificationMethodId');
        else return method;
    }
    catch(e){
        if(e instanceof InvalidParameter) throw e;
        throw new DatabaseError();
    }
}

/**
 * Checks if drizzle db error has a message cause
 * @param e Thrown error
 * @returns Boolean if message cause exists or not
 */
function hasMessageCause(e: unknown): e is Error & { cause: { message: string }}{
    if(!(e instanceof Error)) return false;
    const c = e.cause;
    if (typeof c !== 'object' || c === null) return false;
    return(
        'message' in c && typeof (c as Record<string, unknown>).message === 'string'
    );
}

/**
 * Subscribe to waittime notifications from a specified attraction
 */
app.post('/:id/subscribe', async (c) => {
    const attractionId = parseInt(c.req.param('id'));
    const db = getDbContext(c)
    const user = await getUser(c);

    const notificationMethodId = getNotificationMethodId(c);
    if(!notificationMethodId) throw new MissingParameter('notificationMethodId');

    const method = await getNotificationMethodOwner(db, notificationMethodId, user.id);

    if(!method || method.userId !== user.id) throw new InvalidParameter('notificationMethodId');

    try{
        const res = await db.insert(attractionNotification).values({
            userId: user.id,
            attractionId: attractionId,
            notificationMethodId: notificationMethodId
        }).returning().onConflictDoNothing();

        const message = res.length !== 0
        ? `Successfully subscribed to attraction with id ${attractionId}.`
        : `Your are already subscribed to attraction ${attractionId}. No changes made.`

        return c.json(new Message(message, {attractionId, notificationMethodId}));
    }
    catch(e){
        if(hasMessageCause(e) && e.cause.message.includes('FOREIGN KEY constraint failed')){
            throw new InvalidParameter('attractionId');
        }
        throw new DatabaseError();
    }
})

/**
 * Unsubscribe to waittime notifications from a specified attraction
 */
app.post('/:id/unsubscribe', async (c) => {
    const attractionId = parseInt(c.req.param('id'));
    const db = getDbContext(c)
    const user = await getUser(c);

    const notificationMethodId = getNotificationMethodId(c);
    const methodOwner = notificationMethodId ? await getNotificationMethodOwner(db, notificationMethodId, user.id): false;

    const queryConditions = [
        eq(attractionNotification.userId, user.id),
        eq(attractionNotification.attractionId, attractionId),
        notificationMethodId && methodOwner ? eq(attractionNotification.notificationMethodId, notificationMethodId) : undefined
    ].filter(Boolean);

    try{
        const res = await db.delete(attractionNotification).where(and(...queryConditions)).returning();
        const deletedRecords = res.length;

        const message = deletedRecords !== 0
        ? `Successfully deleted ${deletedRecords} attraction subscriptions.`
        : `You didn't were subscribed to attraction ${attractionId}. No changes made.`

        return c.json(new Message(message, {attractionId, notificationMethodId, deletedRecords}));
    }
    catch(e){
        throw new DatabaseError();
    }
})

export default app