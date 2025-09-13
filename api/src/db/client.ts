import { drizzle } from 'drizzle-orm/d1';
import type { Context } from 'hono';

export interface Env {
    d1_db: D1Database;
}

export function getDbContext(c: Context){
    return drizzle(c.env.d1_db, {
        casing: 'snake_case'
    })
}

export function getDbEnv(env: Env){
    return drizzle(env.d1_db, {
        casing: 'snake_case'
    })
}