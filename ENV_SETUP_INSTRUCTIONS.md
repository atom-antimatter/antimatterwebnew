# Environment Setup Instructions

## Create `.env.local` File

Create a file named `.env.local` in the root directory with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ailcmdpnkzgwvwsnxlav.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpbGNtZHBua3pnd3Z3c254bGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2ODYzMTAsImV4cCI6MjA3NDI2MjMxMH0.kMGbutwYPPztmFf85sgDaPpZryyoIsNCctteGd5ViGY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpbGNtZHBua3pnd3Z3c254bGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY4NjMxMCwiZXhwIjoyMDc0MjYyMzEwfQ.zeVKENE9mXTdUjv51UwTid2GCLPA3cQZj5h8B9mLqHo

# Payload CMS - DATABASE_URL
# Replace [YOUR_PASSWORD] with your actual Supabase database password
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.ailcmdpnkzgwvwsnxlav.supabase.co:5432/postgres

# Payload Secret (already generated for you)
PAYLOAD_SECRET=r69U/cESwCxM/bRi5OQCd1COZ0O/B9MR40+Asj8Q940=

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://www.antimatterai.com

# Admin Setup (for seed script)
ADMIN_EMAIL=admin@antimatterai.com
ADMIN_PASSWORD=Admin123!
```

## Next Steps

Once you've created `.env.local` with your actual passwords:

1. **Run Payload migrations** (creates all tables):
   ```bash
   npm run payload migrate
   ```

2. **Seed initial data** (pages, services, admin user):
   ```bash
   npm run seed
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access Payload admin**:
   - URL: http://localhost:3000/admin
   - Email: admin@antimatterai.com
   - Password: Admin123! (or whatever you set in ADMIN_PASSWORD)

## What Gets Created

When you run `npm run payload migrate`, Payload will create these tables:
- `payload_users` - Admin authentication
- `payload_pages` - All your landing pages
- `payload_blog_posts` - Blog content
- `payload_services` - Service offerings
- `payload_media` - Uploaded files
- `payload_preferences` - User preferences
- `payload_migrations` - Migration tracking

When you run `npm run seed`, it will populate:
- 1 admin user (you)
- ~15 pages (from your hardcoded data)
- ~6 services (from your static files)

## 🎉 That's It!

After these steps, you'll have a fully functional Payload CMS with all your content!

