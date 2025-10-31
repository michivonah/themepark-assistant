import { Hono } from 'hono'
import { DatabaseError } from '../errors'
import { getDbContext } from '../db/client'
import { logbook } from '../db/schema'
import { and, eq } from 'drizzle-orm'
import { getUser } from '../lib/user-auth'
import { Message } from '../types/response'
import { httpZValidator } from '../lib/http-z-validator'
import * as z from 'zod'

const app = new Hono()

/**
 * Lists all logbook entries of the logged in user
 */
app.get('/list', async (c) => {
  const db = getDbContext(c);
  const user = await getUser(c);

  try{
    const logbookEntries = await db.select({
      entryId: logbook.id,
      attractionId: logbook.attractionId,
      timestamp: logbook.timestamp,
      expectedWaittime: logbook.expectedWaittime,
      realWaittime: logbook.realWaittime
    }).from(logbook)
    .where(eq(logbook.userId, user.id));

    return c.json(logbookEntries);
  }
  catch{
    throw new DatabaseError();
  }
})

/**
 * Adds new entry to the logbook of the current user
 */
app.post('/add-entry', httpZValidator('query', z.strictObject({
  attractionId: z.coerce.number(),
  timestamp: z.coerce.number().min(0).positive(),
  expectedWaittime: z.coerce.number().optional(),
  realWaittime: z.coerce.number().optional()
})),
async (c) => {
  const db = getDbContext(c);
  const user = await getUser(c);

  const params = c.req.valid('query');

  try{
    const res = await db.insert(logbook).values({
      userId: user.id,
      attractionId: params.attractionId,
      timestamp: params.timestamp,
      expectedWaittime: params.expectedWaittime,
      realWaittime: params.realWaittime
    }).onConflictDoNothing().returning();

    const newEntry = res[0];

    const message = res.length > 0
    ? 'Added new entry to logbook.'
    : 'Entry already exists. No changes made.';

    return c.json(new Message(message, {
      entryId: newEntry.id,
      attractionId: newEntry.attractionId,
      timestamp: newEntry.timestamp,
      expectedWaittime: newEntry.expectedWaittime,
      realWaittime: newEntry.realWaittime
    }));
  }
  catch{
    throw new DatabaseError();
  }
})

/**
 * Updates waittime information of specified entry (by entryId)
 */
app.put('update-entry', httpZValidator('query', z.strictObject({
  entryId: z.coerce.number(),
  expectedWaittime: z.coerce.number().optional(),
  realWaittime: z.coerce.number().optional()
}).refine((data) => data.expectedWaittime || data.realWaittime)),
async (c) => {
  const db = getDbContext(c);
  const user = await getUser(c);
  const params = c.req.valid('query');

  try{
    const res = await db.update(logbook).set({
      expectedWaittime: params.expectedWaittime,
      realWaittime: params.realWaittime
    }).where(and(
      eq(logbook.userId, user.id),
      eq(logbook.id, params.entryId)
    )).returning();

    const modifiedEntry = res[0];

    return c.json(res.length > 0
      ? new Message('Updated logbook entry.', {
      entryId: modifiedEntry.id,
      attractionId: modifiedEntry.attractionId,
      timestamp: modifiedEntry.timestamp,
      expectedWaittime: modifiedEntry.expectedWaittime,
      realWaittime: modifiedEntry.realWaittime
    })
    : new Message('Requested entry does not exist. No changes made.')
    );
  }
  catch{
    throw new DatabaseError();
  }
})

/**
 * Removes specified logbook entry by entryId
 */
app.delete('remove-entry', httpZValidator('query', z.strictObject({
  entryId: z.coerce.number()
})),
async (c) => {
  const db = getDbContext(c);
  const user = await getUser(c);
  const params = c.req.valid('query');

  try{
    const res = await db.delete(logbook).where(
      and(
        eq(logbook.userId, user.id),
        eq(logbook.id, params.entryId)
      )
    ).returning();

    const message = res.length > 0
    ? `Logbook entry with id ${params.entryId} was removed.`
    : `No logbook entry with id ${params.entryId} found. No changes made.`;

    return c.json(new Message(message));
  }
  catch{
    throw new DatabaseError();
  }
})

export default app