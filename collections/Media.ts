import type { CollectionConfig } from 'payload'
import { createSupabaseStorageAdapter } from '../src/lib/supabaseStorageAdapter'

export const Media: CollectionConfig = {
  slug: 'payload-media',
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'updatedAt'],
  },
  upload: {
    mimeTypes: ['image/*', 'video/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 576, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
    adapter: createSupabaseStorageAdapter({ bucket: process.env.SUPABASE_STORAGE_BUCKET || 'media', public: true }),
    disableLocalStorage: true,
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
}

