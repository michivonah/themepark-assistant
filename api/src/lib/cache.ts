import { cache } from 'hono/cache'

/**
 * Cache unit to use for multiple endpoints as needed (TTL: 86400s)
 */
export const responseCache = cache({
    cacheName: 'themepark-assistant',
    cacheControl: 'max-age=86400'
});

/**
 * Cache for dynamic data (TTL: 30s)
 */
export const dynamicCache = cache({
    cacheName: 'themepark-assistant-dynamic',
    cacheControl: 'max-age=30s'
});