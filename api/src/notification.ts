import { Hono } from 'hono'

const app = new Hono()

app.get('/list', (c) => {
  return c.json(
    {
      message: 'List all notification methods'
    }
  )
})

export default app