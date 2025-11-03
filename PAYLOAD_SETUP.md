# Payload CMS Setup Guide

## 🎉 You're Migrating to Payload CMS!

This guide will help you set up Payload CMS to replace your custom admin interface.

## What's Been Done

✅ Payload CMS 3.0 (beta) installed  
✅ PostgreSQL adapter configured for Supabase  
✅ Collections defined: Users, Pages, BlogPosts, Services, Media  
✅ Lexical rich text editor configured  
✅ SEO plugin integrated  
✅ API routes created (`/api/*`)  
✅ Admin UI routes created (`/admin/*`)  
✅ Seed script created  

## Prerequisites

1. **Supabase Database** - You already have this  
2. **OpenAI API Key** - You already have this  
3. **Node.js 18+** - Check with `node --version`

## Setup Steps

### Step 1: Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update the values in `.env.local`:

```env
# Get your Supabase connection string:
# Supabase Dashboard → Project Settings → Database → Connection string → URI
DATABASE_URL=postgresql://postgres.[your-ref]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Generate a secret key:
# Run: openssl rand -base64 32
PAYLOAD_SECRET=paste_generated_secret_here

# Your existing vars (already set)
NEXT_PUBLIC_SUPABASE_URL=...
OPENAI_API_KEY=...
```

### Step 2: Run Database Migrations

Payload will create all necessary tables automatically:

```bash
npm run payload migrate:create
npm run payload migrate
```

This creates:
- `users` table (with authentication)
- `pages` table (with all SEO fields)
- `blog_posts` table (with chapters, keywords, etc.)
- `services` table (from your static files)
- `media` table (file management)
- `payload_preferences`, `payload_migrations`, etc.

### Step 3: Seed Initial Data

Run the seed script to populate services and pages:

```bash
npm run seed
```

This will:
- Create admin user (check console for credentials)
- Import all pages from `populate-pages/route.ts`
- Import all services from `src/data/services.tsx`

### Step 4: Start the Development Server

```bash
npm run dev
```

### Step 5: Access the Admin Panel

Navigate to: **http://localhost:3000/admin**

Login with:
- **Email:** `admin@antimatterai.com` (or your ADMIN_EMAIL)
- **Password:** Check the seed script output

## 🎨 What You Can Do Now

### Manage Pages

1. Go to `/admin`
2. Click "Pages" in sidebar
3. Create/edit any page
4. Set SEO metadata
5. Publish when ready

### Create Blog Posts

1. Go to `/admin`
2. Click "Blog Posts"
3. Click "Create New"
4. Use Lexical editor to write content
5. Add featured image
6. Set category and keywords
7. Save as draft or publish

### Manage Services

1. Go to `/admin`
2. Click "Services"
3. Edit existing services (imported from static files)
4. Add new services
5. Hide/show services

### Upload Media

1. Go to `/admin`
2. Click "Media"
3. Drag & drop images/videos
4. Add alt text and captions
5. Use in pages/blog posts

## 🤖 AI Blog Generation

The AI blog generation feature needs to be integrated as a custom Payload component. This is the next step in the plan.

For now, you can:
1. Use the AI to generate content locally
2. Copy/paste into Payload's editor
3. Save and publish

**Coming soon:** Integrated AI generation button directly in Payload admin!

## 📁 File Structure

```
/
├── payload.config.ts              ← Payload configuration
├── collections/                   ← Collection schemas
│   ├── Users.ts
│   ├── Pages.ts
│   ├── BlogPosts.ts
│   ├── Services.ts
│   └── Media.ts
├── scripts/
│   └── seed.ts                    ← Data seeding script
├── src/
│   ├── payload-types.ts           ← Auto-generated types
│   └── app/
│       ├── (payload)/
│       │   ├── admin/[[...segments]]/page.tsx
│       │   ├── api/[...slug]/route.ts
│       │   └── layout.tsx
│       ├── blog/                  ← Will update to use Payload
│       └── [services]/            ← Will update to use Payload
```

## 🔄 What's Next

1. ✅ **Payload is installed and configured**
2. ✅ **Collections are defined**
3. ✅ **Seed script is ready**
4. ⏭️ **Run migrations** - `npm run payload migrate`
5. ⏭️ **Run seed** - `npm run seed`
6. ⏭️ **Update frontend** - Replace Supabase calls with Payload API
7. ⏭️ **Integrate AI features** - Add as custom Payload component
8. ⏭️ **Test everything** - Verify all features work
9. ⏭️ **Deploy to Vercel** - With Payload enabled

## 🐛 Troubleshooting

### "Cannot find module '@payload-config'"

Run: `npm run generate:types`

### "Database connection failed"

- Check `DATABASE_URL` in `.env.local`
- Verify Supabase database is accessible
- Try the connection string from Supabase dashboard

### "PAYLOAD_SECRET is required"

- Generate: `openssl rand -base64 32`
- Add to `.env.local`

### Admin login not working

- Run seed script to create admin user: `npm run seed`
- Check console output for credentials

## 📚 Resources

- [Payload CMS Docs](https://payloadcms.com/docs)
- [Next.js Integration](https://payloadcms.com/docs/getting-started/installation#nextjs)
- [PostgreSQL Adapter](https://payloadcms.com/docs/database/postgres)
- [Lexical Editor](https://payloadcms.com/docs/rich-text/lexical)

## 🚀 Ready to Go!

Your Payload CMS is configured and ready. Run the steps above to get started!

