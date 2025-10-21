import { Hono, Context } from 'hono'
import { getDbContext } from '../db/client'
import { attractionNotification } from '../db/schema'
import { and, eq } from 'drizzle-orm'
import { DatabaseError, InvalidParameter, MissingParameter } from '../errors'
import { getUser } from '../lib/user-auth'
import { Message } from '../types/response'
import { getNotificationMethodOwner } from '../lib/check-notification-method-owner'

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