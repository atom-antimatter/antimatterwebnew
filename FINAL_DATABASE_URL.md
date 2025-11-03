# FINAL DATABASE_URL - Copy This Exactly

## ✅ Use This In Vercel

```
postgresql://postgres.ailcmdpnkzgwvwsnxlav:aunqjK18VVLjqcK9@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Breaking It Down

- **Protocol:** `postgresql://`
- **Username:** `postgres.ailcmdpnkzgwvwsnxlav` (your project ref with dot)
- **Password:** `aunqjK18VVLjqcK9`
- **Host:** `aws-0-us-east-1.pooler.supabase.com` (NOT db.xxx)
- **Port:** `6543` (transaction pooler)
- **Database:** `postgres`
- **Params:** `?pgbouncer=true` (required for pooler)

## 🎯 Steps

1. Go to Vercel → Settings → Environment Variables
2. Edit `DATABASE_URL`
3. **Copy the string above EXACTLY**
4. Save
5. Wait 30 seconds
6. Visit: https://www.antimatterai.com/api/payload-health
7. Should show success!
8. Then visit: https://www.antimatterai.com/admin
9. Payload CMS! 🎉

## ⚠️ Common Mistakes

- ❌ Using `db.ailcmdpnkzgwvwsnxlav.supabase.co` (DNS not found)
- ❌ Username just `postgres` instead of `postgres.PROJECT_REF`
- ❌ Wrong port (5432 vs 6543)
- ❌ Missing `pgbouncer=true` parameter

## 💡 This Is The Same String That Works Locally

Check your `.env.local` - it works there, so it will work in Vercel too!

## 🔍 If Still Fails

The issue would be that Supabase hasn't enabled pooler access for your project. In that case, contact Supabase support or check your project settings to enable connection pooling.

But this exact string should work! It's the standard Supabase pooler format.

