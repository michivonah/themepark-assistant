import { Hono } from 'hono'
import { dbConnection } from './db/client'
import { notificationMethod } from './db/schema'

const app = new Hono()

app.get('/list', (c) => {
  return c.json(
    {
      message: 'List all notification methods'
    }
  )
})

export default app