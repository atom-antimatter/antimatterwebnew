# DATABASE_URL Connection String Fix

## 🚨 Current Error

```
Tenant or user not found
```

This means the authentication in DATABASE_URL is failing.

## ✅ Try These Connection Strings (In Order)

Your Supabase project: `ailcmdpnkzgwvwsnxlav`

### Option 1: Session Pooler (Recommended for Vercel)

```
postgresql://postgres.ailcmdpnkzgwvwsnxlav:aunqjK18VVLjqcK9@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**Key changes:**
- Port `5432` (not 6543)
- Username: `postgres.ailcmdpnkzgwvwsnxlav` (full with dot)
- NO `pgbouncer=true` parameter

### Option 2: Transaction Pooler

```
postgresql://postgres.ailcmdpnkzgwvwsnxlav:aunqjK18VVLjqcK9@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Key changes:**
- Port `6543`
- Add `pgbouncer=true`
- Username: `postgres.ailcmdpnkzgwvwsnxlav`

### Option 3: Direct Connection (IPv4 Only)

Get from Supabase Dashboard:
1. Go to Project Settings → Database
2. Find "Connection string" section
3. Select "URI" tab
4. Copy the DIRECT connection string
5. It should look like: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`

## 🔧 How to Update in Vercel

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Click on `DATABASE_URL`
3. Replace the value with **Option 1** first
4. Save
5. Redeploy or wait for auto-redeploy
6. Test `/api/payload-health`
7. If still fails, try Option 2, then Option 3

## 🎯 Expected Result

After correct DATABASE_URL:

**Visit `/api/payload-health`:**
```json
{
  "status": "success",
  "message": "Payload initialized and database connected successfully!",
  "environment": {
    "hasDatabaseUrl": true,
    "hasPayloadSecret": true
  }
}
```

**Then Visit `/admin`:**
- ✅ Payload CMS login page appears
- ✅ Create first user
- ✅ Start using CMS!

## 💡 Quick Test

The connection string that works **locally** (from your `.env.local`) is:

```
postgresql://postgres:aunqjK18VVLjqcK9@db.ailcmdpnkzgwvwsnxlav.supabase.com:5432/postgres
```

But Vercel might need the pooler version for IPv4 compatibility.

## ⚠️ Important

The difference between local and production:
- **Local:** Can use direct connection (db.xxx.supabase.co)
- **Production (Vercel):** Should use pooler (aws-0-us-east-1.pooler.supabase.com)

Try Option 1 first (Session Pooler with port 5432) - this is the most compatible with serverless environments.

