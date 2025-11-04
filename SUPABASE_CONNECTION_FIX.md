# Supabase Connection Fix for Vercel

## Update DATABASE_URL in Vercel

Use **Transaction mode** (port 6543) instead of Session mode for serverless:

```
postgresql://postgres.ailcmdpnkzgwvwsnxlav:yhbioSJyEJPOkjIg@aws-1-us-east-2-ailcmdpnkzgwvwsnxlav.pooler.supabase.net:6543/postgres?sslmode=require&pgbouncer=true&connect_timeout=15
```

## Why This Fix Works

- **Session mode (port 5432)**: Holds persistent connections → hits limits in serverless → db_termination errors
- **Transaction mode (port 6543)**: Recycles connections after each query → works better with serverless functions
- **pgbouncer=true**: Explicitly enables PgBouncer pooling features
- **connect_timeout=15**: Gives enough time for cold starts

## Steps

1. Vercel → Settings → Environment Variables
2. Edit `DATABASE_URL`
3. Paste the string above (Transaction mode, port 6543)
4. Save for Production, Preview, Development
5. Redeploy

## After Update

Visit https://www.antimatterai.com/admin - should load without db_termination errors.

## Alternative (if Transaction mode has issues)

Direct connection (bypasses pooler entirely):
```
postgresql://postgres:yhbioSJyEJPOkjIg@db.ailcmdpnkzgwvwsnxlav.supabase.co:5432/postgres?sslmode=require
```

But pooler is preferred for serverless to avoid exhausting direct connections.

