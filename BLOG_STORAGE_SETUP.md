# Blog Image Storage Setup Guide

This guide explains how to set up the Supabase Storage bucket for blog images.

## 1. Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the sidebar
3. Click **New bucket**
4. Set the following:
   - Name: `blog-images`
   - Public bucket: **Yes** (checked)
   - File size limit: 5MB (recommended)
   - Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`

## 2. Set Up RLS Policies

After creating the bucket, set up Row Level Security policies:

### Policy 1: Public Read Access
```sql
CREATE POLICY "Public read access for blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');
```

### Policy 2: Authenticated Upload
```sql
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');
```

### Policy 3: Authenticated Delete
```sql
CREATE POLICY "Authenticated users can delete blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');
```

## 3. Verify Setup

Test the upload functionality by:
1. Running the blog editor in admin mode
2. Dragging and dropping an image into the TipTap editor
3. Checking that the image appears and is accessible via public URL

## Usage in Code

The following helper functions are available in `src/lib/supabaseClient.ts`:

```typescript
// Upload an image
const result = await uploadBlogImage(file);
if ('url' in result) {
  console.log('Uploaded to:', result.url);
}

// Delete an image
await deleteBlogImage(path);

// Get public URL
const url = getBlogImageUrl(path);
```

## Folder Structure

Blog images are stored with the following structure:
```
blog-images/
  blog-images/
    {timestamp}-{random}.{ext}
```

The double `blog-images` nesting is intentional to organize files within the bucket.

