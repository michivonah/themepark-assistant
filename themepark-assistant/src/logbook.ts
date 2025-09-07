import { Hono } from 'hono'

const app = new Hono()

app.get('/list', (c) => {
  return c.json(
    {
      message: 'List all logbook entries'
    }
  )
})

export default app