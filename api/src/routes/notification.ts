import { Hono } from 'hono'
import { getDbContext } from '../db/client'
import { notificationMethod, user, themepark } from '../db/schema'

const app = new Hono()

app.get('/list', async (c) => {
  const db = getDbContext(c)
  await db.insert(user).values({ username: 'notification'});
  //await db.insert(themepark).values({ name: 'Test', countrycode: 'CH'});
  return c.json(
    {
      message: 'List all notification methods'
    }
  )
})

export default app