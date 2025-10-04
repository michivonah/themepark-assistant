# themepark-assistant
A tool for improving your trips to themeparks - once developed

## Testing
Send request

```bash
curl -H "Authorization: Bearer insecure-token" http://127.0.0.1:8787/notification/list
```

## Update cloudflare d1 db
DB scheme is defined in typescript

apply changes
```bash
npx drizzle-kit push --config=drizzle-dev.config.ts
```

export sql statements instead of running migration
```bash
npx drizzle-kit export --config=drizzle-dev.config.ts
```

## SQLite / D1
Delete view
```sql
DROP VIEW IF EXISTS attraction_subscriptions;
```

## Cloudflare workers tricks
If types are missing, run:
```bash
npx wrangler types
```

## Testing cronjobs
Run worker locally (without remote d1 access)
```bash
npx wrangler dev --test-scheduled
```

Run worker locally (with remote connection to d1)
```bash
npx wrangler dev --remote --test-scheduled
```

Run curl request with cron expression
```bash
curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
```

## Authentication endpoints
- /auth/signin -> Login
- /auth/signout -> Logout
- /auth/callback/github -> Callback for GitHub OAuth config