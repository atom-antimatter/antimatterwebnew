import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { Users } from './collections/Users'
import { Pages } from './collections/Pages'
import { BlogPosts } from './collections/BlogPosts'
import { Media } from './collections/Media'
import { Services } from './collections/Services'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  sharp,
  
  admin: {
    user: 'payload-users',
    meta: {
      titleSuffix: '- Antimatter AI CMS',
    },
  },
  
  editor: lexicalEditor({}),
  
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      max: 2,
      connectionTimeoutMillis: 30000,
    },
    migrationDir: './src/migrations',
    push: false,
  }),
  
  collections: [Users, Pages, BlogPosts, Media, Services],
  
  plugins: [
    seoPlugin({
      collections: ['payload-pages', 'payload-blog-posts'],
      generateTitle: (args) => `${args.doc?.title?.value || args.doc?.title} | Antimatter AI`,
      generateDescription: (args) => args.doc?.excerpt?.value || args.doc?.excerpt,
    }),
  ],
  
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },
  
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-here',
})

