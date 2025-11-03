# Vercel Environment Variables Setup

## ⚠️ Build Failing - Missing Environment Variables

The build is failing because Payload CMS requires `DATABASE_URL` to run migrations during build.

## 🔧 Fix: Add Environment Variables to Vercel

### Go to Vercel Dashboard

1. Open your project: https://vercel.com/your-project
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

### Required Variables

```env
DATABASE_URL
postgresql://postgres:aunqjK18VVLjqcK9@db.ailcmdpnkzgwvwsnxlav.supabase.co:5432/postgres

PAYLOAD_SECRET
r69U/cESwCxM/bRi5OQCd1COZ0O/B9MR40+Asj8Q940=

NEXT_PUBLIC_SUPABASE_URL
https://ailcmdpnkzgwvwsnxlav.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpbGNtZHBua3pnd3Z3c254bGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2ODYzMTAsImV4cCI6MjA3NDI2MjMxMH0.kMGbutwYPPztmFf85sgDaPpZryyoIsNCctteGd5ViGY

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpbGNtZHBua3pnd3Z3c254bGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY4NjMxMCwiZXhwIjoyMDc0MjYyMzEwfQ.zeVKENE9mXTdUjv51UwTid2GCLPA3cQZj5h8B9mLqHo

NEXT_PUBLIC_SITE_URL
https://www.antimatterai.com
```

### Optional (If you want AI features)

```env
OPENAI_API_KEY
your_openai_api_key_here
```

## 📝 Important Notes

1. **DATABASE_URL** is the most critical - Payload won't build without it
2. **PAYLOAD_SECRET** must be the same across all environments (don't change it)
3. Set all variables for **Production**, **Preview**, and **Development** environments
4. After adding variables, trigger a new deployment (Vercel will auto-redeploy)

## 🔄 After Adding Variables

1. Vercel will automatically redeploy
2. Build will run: `payload migrate && next build`
3. Payload will create tables in your Supabase database
4. App will deploy successfully
5. Admin will be accessible at: **https://www.antimatterai.com/admin**

## 🎯 First Deployment

On first deploy, Payload will:
1. Create all database tables automatically
2. Run the migration from `/src/migrations/`
3. Tables will be ready but empty (no admin user yet)

### Create Admin User (After First Deploy)

You have two options:

**Option A: Run seed script locally then deploy**
```bash
npm run seed  # Creates admin + seeds data
git push      # Deploy with data
```

**Option B: Create admin user manually**
1. Go to https://www.antimatterai.com/admin
2. Click "Create First User"
3. Enter credentials
4. Start creating content

## ✅ Checklist

- [ ] Add DATABASE_URL to Vercel
- [ ] Add PAYLOAD_SECRET to Vercel  
- [ ] Add all Supabase keys to Vercel
- [ ] Add NEXT_PUBLIC_SITE_URL to Vercel
- [ ] Wait for automatic redeploy
- [ ] Verify build succeeds
- [ ] Access /admin and create first user
- [ ] Test creating a blog post
- [ ] Verify frontend displays content

## 🎉 Once Complete

You'll have:
- ✅ Professional CMS at /admin
- ✅ Content managed in Supabase
- ✅ Blog posts editable
- ✅ Pages editable
- ✅ Services editable
- ✅ Media library
- ✅ SEO optimization
- ✅ Version history

**Next build should succeed after adding DATABASE_URL!**

