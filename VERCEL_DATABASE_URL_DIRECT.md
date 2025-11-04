# Use Direct Database Connection in Vercel

## Critical: Update DATABASE_URL in Vercel Now

Go to Vercel → Settings → Environment Variables → DATABASE_URL

**Replace with this EXACT string:**

```
postgresql://postgres:yhbioSJyEJPOkjIg@db.ailcmdpnkzgwvwsnxlav.supabase.co:5432/postgres?sslmode=require
```

## Why Direct Connection?

The Supabase pooler is causing authentication errors ("Tenant or user not found") and connection terminations in serverless. 

Direct connection:
- ✅ Simple authentication (username: postgres, password: your-db-password)
- ✅ No pooler auth complexity
- ✅ Works reliably on Vercel serverless
- ✅ Supabase free tier allows 100 direct connections
- ✅ Payload manages its own connection pooling

## After Updating

1. Save the env var for Production, Preview, and Development
2. Redeploy (Vercel will auto-trigger)
3. Visit: https://www.antimatterai.com/api/payload-health?init=true
   - Should show: `"payload": { "initialized": true }`
4. Visit: https://www.antimatterai.com/admin
   - Should show: Payload login screen (no 500 error)
5. Create your first admin user
6. Start managing blog posts!

## Connection String Breakdown

- **Protocol**: `postgresql://`
- **Username**: `postgres`
- **Password**: `yhbioSJyEJPOkjIg` (your database password)
- **Host**: `db.ailcmdpnkzgwvwsnxlav.supabase.co` (direct database)
- **Port**: `5432` (standard Postgres)
- **Database**: `postgres`
- **SSL**: `sslmode=require` (required by Supabase)

## If You Need Pooler Later

Once admin is working, if you need to scale:
- Upgrade Supabase plan for more pooler connections
- Or use Supabase's IPv6 pooler with correct format

But for now, direct connection is the most reliable path.

