# ✅ Use Supabase Pooler (Session) for DATABASE_URL

Copy the EXACT string from Supabase Dashboard → Database → Connection pooling → Session.

```
postgresql://postgres.<project_ref>:<password>@aws-<region>-<project_ref>.pooler.supabase.net:5432/postgres?sslmode=require
```

## How To Update in Vercel

1. Go to: https://vercel.com/
2. Select your project (antimatterwebnew)
3. Click: **Settings** → **Environment Variables**
4. Edit `DATABASE_URL`
5. Paste the Session Pooler string EXACTLY from the Dashboard
6. Set for Production, Preview, and Development
7. Save
8. Redeploy (Vercel usually redeploys automatically)

## Test After Update

1. Visit: **https://www.antimatterai.com/api/payload-health**
2. Expect JSON with `dns.ok: true` and `db.connected: true`
3. Then visit: **https://www.antimatterai.com/admin**

## Notes

- Do NOT use the direct host `db.<project>.supabase.co` on serverless
- Username must include project ref: `postgres.<project_ref>`
- Keep `sslmode=require`

