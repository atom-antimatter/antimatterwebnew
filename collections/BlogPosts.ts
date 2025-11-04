import type { CollectionConfig } from 'payload'

export const BlogPosts: CollectionConfig = {
  slug: 'payload-blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', '_status', 'publishedAt'],
    description: 'Manage blog posts with AI-powered content generation',
    preview: (doc) => {
      if (doc?.slug) {
        return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.antimatterai.com'}/blog/${doc.slug}`
      }
      return null
    },
    livePreview: {
      url: ({ data }) => {
        if (data?.slug) {
          return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.antimatterai.com'}/blog/${data.slug}?preview=true`
        }
        return ''
      },
    },
  },
  versions: {
    drafts: true,
  },
  access: {
    read: ({ req: { user } }) => {
      // Admins can read all, public can only read published
      if (user) return true
      return {
        _status: {
          equals: 'published',
        },
      }
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly slug (auto-generated from title)',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 300,
      admin: {
        description: 'Brief summary for listing pages and meta description',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'payload-media',
      admin: {
        description: 'Main header image for the blog post',
      },
    },
    {
      name: 'featuredImageAlt',
      type: 'text',
      admin: {
        description: 'Alt text for accessibility and SEO',
      },
    },
    {
      name: 'author',
      type: 'text',
      defaultValue: 'Antimatter AI',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'AI Trends & News', value: 'ai-trends' },
        { label: 'Company News', value: 'company-news' },
        { label: 'Guides & Insights', value: 'guides-insights' },
      ],
      required: true,
      admin: {
        description: 'Categorize your blog post',
      },
    },
    {
      name: 'seoKeywords',
      type: 'array',
      fields: [
        {
          name: 'keyword',
          type: 'text',
        },
      ],
      admin: {
        description: 'Target keywords for SEO (5-8 recommended)',
      },
    },
    {
      name: 'metaTitle',
      type: 'text',
      maxLength: 60,
      admin: {
        description: 'SEO title (leave empty to use post title). 50-60 characters recommended.',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      maxLength: 160,
      admin: {
        description: 'SEO meta description. 150-160 characters recommended.',
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Auto-calculated from content (minutes)',
      },
    },
    {
      name: 'chapters',
      type: 'json',
      admin: {
        readOnly: true,
        description: 'Auto-extracted from H2/H3 headings for table of contents',
      },
    },
    {
      name: 'internalLinks',
      type: 'relationship',
      relationTo: ['payload-pages', 'payload-blog-posts'],
      hasMany: true,
      admin: {
        description: 'Link to related pages and blog posts',
      },
    },
    {
      name: 'externalSources',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'url',
          type: 'text',
        },
        {
          name: 'type',
          type: 'select',
          options: ['article', 'video', 'documentation', 'research'],
        },
      ],
      admin: {
        description: 'External citations and sources',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        description: 'When the post was published (auto-set on first publish)',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Calculate reading time from content
        if (data.content) {
          const contentStr = JSON.stringify(data.content)
          const text = contentStr.replace(/<[^>]*>/g, '')
          const wordCount = text.split(/\s+/).filter(Boolean).length
          data.readingTime = Math.max(1, Math.ceil(wordCount / 200))
        }

        // Set publishedAt on first publish
        if (data._status === 'published' && !data.publishedAt && operation === 'update') {
          data.publishedAt = new Date().toISOString()
        }

        return data
      },
    ],
  },
}

