# Vercel Environment Variables Setup

## ⚠️ Runtime DB connectivity (serverless best practice)

Use Supabase Connection Pooler (Session) for serverless. Do not use the direct host `db.<project>.supabase.co`.

## 🔧 Fix: Add Environment Variables to Vercel

### Go to Vercel Dashboard

1. Open your project: https://vercel.com/your-project
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

### Required Variables

In Vercel → Settings → Environment Variables add/update:

```env
# Copy the EXACT Session Pooler string from Supabase Dashboard → Database → Connection pooling → Session
DATABASE_URL=postgresql://postgres.<project_ref>:<password>@aws-<region>-<project_ref>.pooler.supabase.net:5432/postgres?sslmode=require

PAYLOAD_SECRET=<your-payload-secret>

NEXT_PUBLIC_SUPABASE_URL=https://<project_ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

NEXT_PUBLIC_SITE_URL=https://www.antimatterai.com
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
2. Build runs `next build`; DB access happens at runtime
3. Visit: **/api/payload-health** to confirm DNS and DB connectivity
4. Then visit: **/admin**

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

