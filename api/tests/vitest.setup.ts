import { config } from 'dotenv'
import { env } from 'cloudflare:test'

config()

Object.assign(env, process.env)