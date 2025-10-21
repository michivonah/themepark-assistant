# themepark-assistant
A tool for improving your trips to themeparks - once developed

> HINT: The tool is currently under development. The API endpoints are subject to change at any time. Use with caution.

## Repo structure
- /api: API implementation
    - ./: config files
    - /src: API Code
        - /db: Database client, schema & migrations
        - /errors: Error types
            - index.ts: Exporter for all error classes
        - /jobs: Background tasks
        - /lib: Reusable functions
        - /routes: API Endpoints
        - /types: Data type definitions
        - index.ts: Entrypoint for API Requests & background tasks on Cloudflare Workers


## Development
### Run enviromnment
Run worker locally (without remote d1 access, scheduled tasks not available)
```bash
npx wrangler dev
```

Run worker locally (without remote d1 access, scheduled tasks available)
```bash
npx wrangler dev --test-scheduled
```

Run worker locally (with remote connection to d1, scheduled tasks available)
```bash
npx wrangler dev --remote --test-scheduled
```

### Requests
Send request with bearer authentication
```bash
curl -H "Authorization: Bearer insecure-token" http://127.0.0.1:8787/notification/list
```

Run request with cron expression (for executing background tasks)
```bash
curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
```

### Drizzle DB migrations
Update cloudflare d1 db
DB scheme is defined in typescript

apply changes
```bash
npx drizzle-kit push --config=drizzle-dev.config.ts
```

export sql statements instead of running migration
```bash
npx drizzle-kit export --config=drizzle-dev.config.ts
```

### Useful sql statements for SQLite / D1
Delete view
```sql
DROP VIEW IF EXISTS attraction_subscriptions;
```

### Cloudflare workers tricks
If types are missing, run:
```bash
npx wrangler types
```

## Authentication endpoints (auth.js)
- /auth/signin -> Login
- /auth/signout -> Logout
- /auth/callback/github -> Callback for GitHub OAuth config

## Contributing
TBD

## License
TBD