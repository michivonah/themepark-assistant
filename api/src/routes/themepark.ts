import { Hono } from 'hono'
import { getDbContext } from '../db/client'
import { themepark, attraction } from '../db/schema'
import { responseCache } from '../lib/cache'
import { eq } from 'drizzle-orm'
import { DatabaseError } from '../errors'
import { idValidator } from '../lib/http-z-validator'

const app = new Hono()

/**
 * Lists all available themeparks with their id, name & countrycode
 */
app.get('/list', responseCache, async (c) => {
    const db = getDbContext(c)

    try{
        const themeparks = await db.select({
            id: themepark.id,
            name: themepark.name,
            countrycode: themepark.countrycode
        }).from(themepark);

        return c.json(themeparks);
    }
    catch{
        throw new DatabaseError();
    }
})

/**
 * Lists all attractions from a themepark with their id & name
 */
app.get('/list/:id/attraction', responseCache, idValidator, async (c) => {
    const parkId = c.req.valid('param').id;
    const db = getDbContext(c)

    try{
        const attractions = await db.select({
            id: attraction.id,
            name: attraction.name,
        }).from(attraction)
        .where(eq(attraction.themeparkId, parkId));

        return c.json(attractions);
    }
    catch{
        throw new DatabaseError();
    }
})

export default app