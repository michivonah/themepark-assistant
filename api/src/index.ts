import { Hono } from 'hono'
import { authHandler, initAuthConfig, verifyAuth } from '@hono/auth-js'
import GitHub from '@auth/core/providers/github'
import notification from './routes/notification'
import logbook from './routes/logbook'
import cronRouter from './jobs/cron'

// create app
const app = new Hono()

// OAuth via Auth.js
app.use('*', initAuthConfig((c) => ({
    secret: c.env.AUTH_SECRET,
    providers: [
        GitHub({
            clientId: c.env.GITHUB_ID,
            clientSecret: c.env.GITHUB_SECRET,
        })
    ]
})))

app.use('/auth/*', authHandler())

app.use('/*', verifyAuth())

// example endpoint
app.get('/protected', (c) => {
  const auth = c.get('authUser')
  return c.json(auth)
})

// define routes & export app
app.route('/notification', notification)
app.route('/logbook', logbook)
export default {
    fetch: app.fetch,
    scheduled: cronRouter,
}
