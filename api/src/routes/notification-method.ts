import { Hono } from 'hono'
import { getDbContext } from '../db/client'
import { notificationMethod, notificationProvider } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import { getUser } from '../lib/user-auth'
import { DatabaseError, InvalidParameter, MissingParameter } from '../errors'
import { Message } from '../types/response'

const app = new Hono()

/**
 * Gets you the id of a notificaton provider by name
 * @param db DB connection (as const)
 * @param name Name of the notification provider
 * @returns Id of the specified notification provider's name (undefined if not exists)
 */
async function getProviderId(db: ReturnType<typeof getDbContext>, name: string){
  try{
    const provider = await db.select({
      id: notificationProvider.id
    }).from(notificationProvider)
    .where(eq(notificationProvider.name, name)).get();

    return provider?.id;
  }
  catch(e){
    throw new InvalidParameter('provider');
  }
}

/** Returns a list of all notification methods a user owns */
app.get('/list', async (c) => {
  const db = getDbContext(c);
  const user = await getUser(c);

  try{
    const methods = await db.select({
      id: notificationMethod.id,
      webhook: notificationMethod.webhookUrl,
      name: notificationMethod.shownName,
      provider: notificationProvider.name
    }).from(notificationMethod)
    .where(eq(notificationMethod.userId, user.id))
    .innerJoin(notificationProvider, eq(notificationMethod.notificationProviderId, notificationProvider.id));

    return c.json(methods);
  }
  catch(e){
    throw new DatabaseError();
  }
})

/** Lists all available notification providers */
app.get('/list-providers', async (c) => {
  const db = getDbContext(c);

  try{
    const providers = await db.selectDistinct({
      name: notificationProvider.name
    }).from(notificationProvider)
    .where(eq(notificationProvider.isActive, true));

    return c.json(providers);
  }
  catch{
    throw new DatabaseError();
  }
})

/** Creates a new notification method from url, name & provider */
app.post('/add-method', async (c) => {
  const db = getDbContext(c);
  const user = await getUser(c);

  const { url, name, provider } = c.req.query();

  if(!url || !name || !provider) throw new MissingParameter();

  const providerId = await getProviderId(db, provider);
  if(!providerId) throw new InvalidParameter('provider');

  try{
    const newMethod = await db.insert(notificationMethod).values({
      webhookUrl: url,
      shownName: name,
      userId: user.id,
      notificationProviderId: providerId
    }).returning().onConflictDoNothing().get();

    return c.json(
      newMethod
      ? new Message('Successfull created new notification method.', {
        id: newMethod.id,
        webhook: newMethod.webhookUrl,
        name: newMethod.shownName
      })
      : new Message('Notification method with this URL already exists. No changes made.')
    );
  }
  catch(e){
    throw new DatabaseError();
  }
})

/** Removes a existing notification method by id (has to be owned by the current user) */
app.delete('/remove-method/:id', async (c) => {
  const db = getDbContext(c);
  const user = await getUser(c);
  const methodId = parseInt(c.req.param('id'));

  if(!methodId) throw new InvalidParameter('id');

  try{
    const res = await db.delete(notificationMethod).where(
      and(
        eq(notificationMethod.id, methodId),
        eq(notificationMethod.userId, user.id)
      )
    ).returning();

    return c.json(new Message(
      res.length > 0
      ? `Notification method ${methodId} was removed.`
      : `No matching notification method with id ${methodId}. No changes made.`,
      {
        notificationMethodId: methodId
      }
    ))
  }
  catch{
    throw new DatabaseError();
  }
})

export default app