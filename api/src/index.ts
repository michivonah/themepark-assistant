import { Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
import notification from './notification'
import logbook from './logbook'
import cronRouter from './jobs/cron'

// create app
const app = new Hono()

// add bearer authentication
const token = 'insecure-token'

app.use('/*', bearerAuth({ token }))

// define routes & export app
app.route('/notification', notification)
app.route('/logbook', logbook)
export default {
    fetch: app.fetch,
    scheduled: cronRouter,
}
