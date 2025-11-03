# FINAL DATABASE_URL - Copy This Exactly

## ✅ Use Supabase Connection Pooler (Session) in Vercel

Copy the EXACT string from Supabase Dashboard → Database → Connection pooling → Session.

```
postgresql://postgres.<project_ref>:<password>@aws-<region>-<project_ref>.pooler.supabase.net:5432/postgres?sslmode=require
```

## Breaking It Down

- **Protocol:** `postgresql://`
- **Username:** `postgres.<project_ref>` (includes your project ref)
- **Password:** `<password>` (from Dashboard)
- **Host:** `aws-<region>-<project_ref>.pooler.supabase.net` (NOT db.xxx)
- **Port:** `5432` (Session pooler)
- **Database:** `postgres`
- **Params:** `?pgbouncer=true` (required for pooler)

## 🎯 Steps

1. Go to Vercel → Settings → Environment Variables
2. Edit `DATABASE_URL`
3. **Paste the Session Pooler string from the Dashboard EXACTLY**
4. Save
5. Wait 30 seconds
6. Visit: https://www.antimatterai.com/api/payload-health
7. Should show success!
8. Then visit: https://www.antimatterai.com/admin
9. Payload CMS! 🎉

## ⚠️ Common Mistakes

- ❌ Using `db.<project>.supabase.co` (use Pooler domain)
- ❌ Username just `postgres` (must be `postgres.<project_ref>`)
- ❌ Missing `sslmode=require`

## 💡 This Is The Same String That Works Locally

Check your `.env.local` - it works there, so it will work in Vercel too!

## 🔍 If Still Fails

The issue would be that Supabase hasn't enabled pooler access for your project. In that case, contact Supabase support or check your project settings to enable connection pooling.

But this exact string should work! It's the standard Supabase pooler format.

