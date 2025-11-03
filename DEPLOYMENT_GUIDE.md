# Payload CMS Deployment Guide

## ✅ Build Process Changed

**Important:** Migrations are NO LONGER run during build time to avoid database connection issues on Vercel.

### How It Works Now

1. **Build Time:**
   - ✅ Next.js app builds successfully
   - ✅ No database connection required
   - ✅ No migration errors

2. **Runtime (First Request):**
   - ✅ When you first access `/admin`, Payload initializes
   - ✅ Migrations run automatically
   - ✅ Tables are created in Supabase
   - ✅ CMS is ready to use

### Deployment Steps

1. **Push to Main** (Already Done ✅)
   ```bash
   git push origin main
   ```

2. **Vercel Builds** (Automatic)
   - Runs `next build` (no migrations)
   - Builds successfully
   - Deploys to production

3. **Access Admin to Initialize**
   - Visit: https://www.antimatterai.com/admin
   - Payload initializes and runs migrations
   - Creates all database tables
   - Shows admin login page

4. **Create First User**
   - Click "Create your first user"
   - Enter:
     - Email: admin@antimatterai.com
     - Password: [your secure password]
   - Submit

5. **Start Using CMS**
   - Create pages, blog posts, services
   - Upload media
   - Manage all content

## 🔧 Manual Migration (If Needed)

If you want to run migrations manually before accessing admin:

**Option A: Via API Route**
```bash
curl https://www.antimatterai.com/api/payload-migrate
```

**Option B: Locally Then Deploy**
```bash
npm run migrate  # Runs locally
git push         # Deploy
```

## 📋 Environment Variables in Vercel

Make sure these are set:

```env
DATABASE_URL=postgresql://postgres.ailcmdpnkzgwvwsnxlav:aunqjK18VVLjqcK9@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
PAYLOAD_SECRET=r69U/cESwCxM/bRi5OQCd1COZ0O/B9MR40+Asj8Q940=
NEXT_PUBLIC_SUPABASE_URL=https://ailcmdpnkzgwvwsnxlav.supabase.co
NEXT_PUBLIC_SITE_URL=https://www.antimatterai.com
```

## 🎯 Expected Behavior

### First Deployment
1. Build succeeds ✅
2. Deploy succeeds ✅
3. First visit to `/admin` → migrations run → tables created
4. Create first user
5. CMS ready!

### Subsequent Deployments
1. Build succeeds ✅
2. Deploy succeeds ✅
3. Tables already exist
4. Login and continue using CMS

## 🚨 Troubleshooting

### "Relation does not exist" Error on First `/admin` Visit

This is normal! It means migrations haven't run yet.

**Fix:** Refresh the page. Payload will run migrations and tables will be created.

### Build Still Failing

Check:
- DATABASE_URL is set in Vercel ✅
- PAYLOAD_SECRET is set in Vercel ✅
- Build script doesn't include `payload migrate` ✅

### Can't Create First User

- Access `/api/payload-migrate` first to ensure migrations ran
- Check Supabase logs for any errors
- Verify DATABASE_URL has correct password

## ✨ Benefits of This Approach

- ✅ **No build-time DB connection needed**
- ✅ **Works perfectly on Vercel serverless**
- ✅ **Faster builds**
- ✅ **Migrations run when actually needed**
- ✅ **Standard Payload + Vercel pattern**

## 📚 Next Steps After Deployment

1. Visit `/admin` to initialize Payload
2. Create admin user
3. Create your first blog post
4. Upload some media
5. Test the frontend to see your content

Your CMS is production-ready! 🎊

