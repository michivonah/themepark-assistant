# themepark-assistant
A tool for improving your trips to themepark - once developed

## Testing
Send request

```bash
curl -H "Authorization: Bearer insecure-token" http://127.0.0.1:8787/notification/list
```

## Update cloudflare d1 db
DB scheme is defined in typescript

apply changes
```bash
npx drizzle-kit push
```