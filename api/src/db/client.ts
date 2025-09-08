import { drizzle } from 'drizzle-orm/d1';
import type { Context } from 'hono';

export function dbConnection(c: Context){
    return drizzle({
        connection: c.env.db,
        casing: 'snake_case'
    })
}