import { drizzle } from 'drizzle-orm/d1';
import type { Context } from 'hono';

export function dbConn(c: Context){
    return drizzle(c.env.d1_db, {
        casing: 'snake_case'
    })
}