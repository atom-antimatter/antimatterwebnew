import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import path from 'path'
import { fileURLToPath } from 'url'
import { Users } from './collections/Users.ts'
import { Pages } from './collections/Pages.ts'
import { BlogPosts } from './collections/BlogPosts.ts'
import { Media } from './collections/Media.ts'
import { Services } from './collections/Services.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  
  admin: {
    user: 'payload-users',
    meta: {
      titleSuffix: '- Antimatter AI CMS',
      favicon: '/favicon.ico',
      ogImage: '/images/HeroOpenGraph.png',
    },
  },
  
  editor: lexicalEditor({}),
  
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || (() => {
        throw new Error('DATABASE_URL environment variable is required')
      })(),
    },
    push: false, // Don't auto-push schema changes (safer for production)
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

