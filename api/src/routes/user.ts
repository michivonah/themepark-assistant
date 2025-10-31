import { Hono } from 'hono'
import { DatabaseError } from '../errors'
import { getDbContext } from '../db/client'
import { getUser } from '../lib/user-auth'
import { user } from '../db/schema'
import { eq } from 'drizzle-orm'
import { Message } from '../types/response'
import * as z from 'zod'
import httpZValidator from '../lib/http-z-validator'

const app = new Hono()

/**
 * Deletes user account with all associated data (requires parameter 'confirm' to be true)
 * Be careful when using (once your data is delete it cannot be restored)
 */
app.delete('delete-account', httpZValidator('query', z.strictObject({
  confirm: z.literal('true') // to prevent unwanted account deletion when hitting the endpoint unintentionally
})),
async (c) => {
  const db = getDbContext(c);
  const currentUser = await getUser(c);
  const params = c.req.valid('query');

  try{
    const res = await db.delete(user).where(
        eq(user.id, currentUser.id)
    ).returning();

    const deletedUser = res[0];

    const message = res.length > 0
    ? `User account ${deletedUser.mail} with all associated data deleted.`
    : 'User account does not exist. No changes made.';

    return c.json(new Message(message));
  }
  catch(e){
    console.error(e);
    throw new DatabaseError();
  }
})

export default app