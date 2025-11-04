import type { Plugin } from 'payload'
import { createClient } from '@supabase/supabase-js'

export const supabaseStoragePlugin = (): Plugin => ({
  name: 'supabase-storage',
  
  hooks: {
    afterRead: [
      {
        collection: 'payload-media',
        hook: async ({ doc }) => {
          // Generate Supabase public URLs for media
          if (doc.filename && process.env.NEXT_PUBLIC_SUPABASE_URL) {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'media'
            doc.url = `${supabaseUrl}/storage/v1/object/public/${bucket}/${doc.filename}`
          }
          return doc
        },
      },
    ],
    
    beforeChange: [
      {
        collection: 'payload-media',
        hook: async ({ data, req, operation }) => {
          // Handle file upload to Supabase Storage
          if (operation === 'create' && req.file) {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
            
            if (!supabaseUrl || !serviceKey) {
              throw new Error('Supabase credentials not configured')
            }
            
            const supabase = createClient(supabaseUrl, serviceKey)
            const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'media'
            
            const file = req.file
            const filename = `${Date.now()}-${file.name}`
            
            // Upload to Supabase
            const { error } = await supabase.storage
              .from(bucket)
              .upload(filename, file.data, {
                contentType: file.mimetype,
                upsert: true,
              })
            
            if (error) {
              throw new Error(`Upload failed: ${error.message}`)
            }
            
            // Store metadata
            data.filename = filename
            data.mimeType = file.mimetype
            data.filesize = file.size
            
            // Generate public URL
            const { data: urlData } = supabase.storage
              .from(bucket)
              .getPublicUrl(filename)
            
            data.url = urlData.publicUrl
          }
          
          return data
        },
      },
    ],
    
    beforeDelete: [
      {
        collection: 'payload-media',
        hook: async ({ doc }) => {
          // Delete from Supabase Storage
          if (doc.filename) {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
            
            if (supabaseUrl && serviceKey) {
              const supabase = createClient(supabaseUrl, serviceKey)
              const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'media'
              
              await supabase.storage.from(bucket).remove([doc.filename])
            }
          }
        },
      },
    ],
  },
})

