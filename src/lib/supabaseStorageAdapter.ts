import { createClient } from '@supabase/supabase-js'

type SupabaseAdapterOptions = {
  bucket?: string
  public?: boolean
  folder?: string
}

export const createSupabaseStorageAdapter = (opts: SupabaseAdapterOptions = {}) => {
  const bucket = opts.bucket || process.env.SUPABASE_STORAGE_BUCKET || 'media'
  const isPublic = opts.public ?? true
  const folder = opts.folder || ''

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase adapter requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars')
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  const ensureBucket = async () => {
    try {
      // Try to create the bucket (idempotent)
      await supabase.storage.createBucket(bucket, { public: isPublic })
    } catch (e) {
      // ignore if exists
    }
  }

  const buildPath = (filename: string) => (folder ? `${folder}/${filename}` : filename)

  return {
    name: 'supabase-storage',
    generateURL: ({ filename }: { filename: string }) => {
      const path = buildPath(filename)
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return data.publicUrl
    },
    handleDelete: async ({ filename }: { filename: string }) => {
      const path = buildPath(filename)
      await supabase.storage.from(bucket).remove([path])
    },
    handleUpload: async ({ file, filename }: { file: any; filename: string }) => {
      await ensureBucket()
      const path = buildPath(filename)
      const buffer: Buffer = file?.buffer || file?.data || file
      const contentType: string = file?.mimetype || file?.mimeType || 'application/octet-stream'
      const size: number = file?.size || buffer?.length || 0
      const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
        contentType,
        upsert: true,
      })
      if (error) throw error
      return {
        size,
        mimeType: contentType,
      }
    },
  } as any
}


