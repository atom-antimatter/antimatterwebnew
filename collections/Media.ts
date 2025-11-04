import type { CollectionConfig } from 'payload'
import { createClient } from '@supabase/supabase-js'

export const Media: CollectionConfig = {
  slug: 'payload-media',
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'updatedAt'],
  },
  upload: {
    staticDir: 'public/uploads',
    mimeTypes: ['image/*', 'video/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 576, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
  hooks: {
    afterRead: [
      async ({ doc }) => {
        if (doc.filename && process.env.NEXT_PUBLIC_SUPABASE_URL) {
          const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'media'
          doc.url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${doc.filename}`
        }
        return doc
      },
    ],
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.file) {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
          
          if (supabaseUrl && serviceKey) {
            const supabase = createClient(supabaseUrl, serviceKey)
            const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'media'
            const filename = `${Date.now()}-${req.file.name}`
            
            const { error } = await supabase.storage
              .from(bucket)
              .upload(filename, req.file.data, {
                contentType: req.file.mimetype,
                upsert: true,
              })
            
            if (!error) {
              data.filename = filename
              const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename)
              data.url = urlData.publicUrl
            }
          }
        }
        return data
      },
    ],
  },
}

