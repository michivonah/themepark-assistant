import { Hono } from 'hono'
import { authHandler, initAuthConfig, verifyAuth } from '@hono/auth-js'
import { getUser } from './lib/user-auth'
import GitHub from '@auth/core/providers/github'
import attraction from './routes/attraction'
import notification from './routes/notification'
import logbook from './routes/logbook'
import themepark from './routes/themepark'
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
app.get('/protected', async (c) => {
    const user = await getUser(c);
    return c.json(user);
})

// define routes & export app
app.route('/attraction', attraction)
app.route('/notification', notification)
app.route('/logbook', logbook)
app.route('/themepark', themepark)
export default {
    fetch: app.fetch,
    scheduled: cronRouter,
}
