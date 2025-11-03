import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import path from 'path'
import { fileURLToPath } from 'url'
import { Users } from './collections/Users'
import { Pages } from './collections/Pages'
import { BlogPosts } from './collections/BlogPosts'
import { Media } from './collections/Media'
import { Services } from './collections/Services'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Antimatter AI CMS',
      favicon: '/favicon.ico',
      ogImage: '/images/HeroOpenGraph.png',
    },
  },
  
  editor: lexicalEditor({}),
  
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL!,
    },
    push: false, // Don't auto-push schema changes (safer for production)
  }),
  
  collections: [Users, Pages, BlogPosts, Media, Services],
  
  plugins: [
    seoPlugin({
      collections: ['pages', 'blog-posts'],
      generateTitle: ({ doc }: any) => `${doc?.title?.value || doc?.title} | Antimatter AI`,
      generateDescription: ({ doc }: any) => doc?.excerpt?.value || doc?.excerpt,
    }),
  ],
  
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },
  
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-here',
})

