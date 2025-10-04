import { cache } from 'hono/cache'

/**
 * Cache unit to use for multiple endpoints as needed
 */
export const responseCache = cache({
    cacheName: 'themepark-assistant',
    cacheControl: 'max-age=86400'
});