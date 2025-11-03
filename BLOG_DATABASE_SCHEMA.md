# Blog Database Schema

This document describes the database schema for the blog system.

## Table: `blog_posts`

### SQL Migration

Run this SQL in your Supabase SQL Editor to create/update the blog_posts table:

```sql
-- Create blog_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  featured_image_alt TEXT,
  author TEXT NOT NULL DEFAULT 'Antimatter AI',
  category TEXT,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- SEO Fields
  seo_keywords TEXT[],
  reading_time INTEGER,
  
  -- Chapter Navigation
  chapters JSONB,
  
  -- Internal Linking
  internal_links TEXT[],
  
  -- External Sources/Citations
  external_sources JSONB
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published posts
CREATE POLICY "Anyone can read published blog posts"
ON blog_posts FOR SELECT
USING (published = true);

-- Policy: Authenticated users can read all posts (for admin)
CREATE POLICY "Authenticated users can read all blog posts"
ON blog_posts FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated users can insert posts
CREATE POLICY "Authenticated users can insert blog posts"
ON blog_posts FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Authenticated users can update posts
CREATE POLICY "Authenticated users can update blog posts"
ON blog_posts FOR UPDATE
TO authenticated
USING (true);

-- Policy: Authenticated users can delete posts
CREATE POLICY "Authenticated users can delete blog posts"
ON blog_posts FOR DELETE
TO authenticated
USING (true);
```

## Field Descriptions

### Basic Fields

- **id**: UUID primary key
- **title**: Blog post title
- **slug**: URL-friendly slug (unique)
- **excerpt**: Brief description for listing pages
- **content**: Full HTML content from TipTap editor
- **featured_image**: URL to featured/header image
- **featured_image_alt**: Alt text for featured image (accessibility)
- **author**: Author name
- **category**: Post category (AI & Machine Learning, Product Development, Case Studies, Company News)
- **published**: Boolean flag for published status
- **published_at**: Timestamp when published
- **created_at**: Creation timestamp
- **updated_at**: Last update timestamp

### SEO Fields

- **seo_keywords**: Array of target keywords for SEO
- **reading_time**: Estimated reading time in minutes (auto-calculated)

### Chapter Navigation

- **chapters**: JSON array of chapter objects:
  ```json
  [
    {
      "id": "chapter-anchor-id",
      "title": "Chapter Title",
      "level": 2
    }
  ]
  ```

### Internal Linking

- **internal_links**: Array of slugs to other pages/posts for SEO and sitemap

### External Sources

- **external_sources**: JSON array of citation/source objects:
  ```json
  [
    {
      "title": "Source Title",
      "url": "https://example.com",
      "type": "article"
    }
  ]
  ```

## Example Query

```sql
-- Get published posts with pagination
SELECT 
  id,
  title,
  slug,
  excerpt,
  featured_image,
  featured_image_alt,
  author,
  category,
  reading_time,
  published_at
FROM blog_posts
WHERE published = true
ORDER BY published_at DESC
LIMIT 10 OFFSET 0;

-- Get single post by slug
SELECT *
FROM blog_posts
WHERE slug = 'your-blog-post-slug'
AND published = true;

-- Get posts by category
SELECT *
FROM blog_posts
WHERE category = 'AI & Machine Learning'
AND published = true
ORDER BY published_at DESC;
```

## TypeScript Interface

```typescript
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  featured_image_alt: string | null;
  author: string;
  category: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  seo_keywords: string[] | null;
  reading_time: number | null;
  chapters: Array<{
    id: string;
    title: string;
    level: number;
  }> | null;
  internal_links: string[] | null;
  external_sources: Array<{
    title: string;
    url: string;
    type: string;
  }> | null;
}
```

