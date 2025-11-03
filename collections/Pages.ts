import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'category', 'updatedAt'],
    description: 'Manage landing pages, service pages, and static content',
  },
  versions: {
    drafts: true,
  },
  access: {
    read: () => true, // Public can read published pages
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
        description: 'URL path (e.g., /about, /services/ai-development)',
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
      name: 'content',
      type: 'richText',
      required: false,
      admin: {
        description: 'Optional - some pages use React components instead',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Main', value: 'main' },
        { label: 'Services', value: 'services' },
        { label: 'Solutions', value: 'solutions' },
        { label: 'Case Study', value: 'case-study' },
        { label: 'Demo', value: 'demo' },
      ],
      admin: {
        description: 'Organize pages by category',
      },
    },
    {
      name: 'parentPage',
      type: 'relationship',
      relationTo: 'pages',
      admin: {
        description: 'Create hierarchical page structure',
      },
    },
    {
      name: 'internalLinks',
      type: 'relationship',
      relationTo: 'pages',
      hasMany: true,
      admin: {
        description: 'Pages this page links to (for SEO and sitemap)',
      },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaDescription',
          type: 'textarea',
          maxLength: 160,
          admin: {
            description: 'Brief description for search engines (150-160 characters)',
          },
        },
        {
          name: 'metaKeywords',
          type: 'text',
          admin: {
            description: 'Comma-separated keywords',
          },
        },
        {
          name: 'canonicalUrl',
          type: 'text',
        },
        {
          name: 'ogTitle',
          type: 'text',
        },
        {
          name: 'ogDescription',
          type: 'textarea',
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'twitterTitle',
          type: 'text',
        },
        {
          name: 'twitterDescription',
          type: 'textarea',
        },
        {
          name: 'twitterImage',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Prevent search engines from indexing this page',
          },
        },
      ],
    },
    {
      name: 'isHomepage',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Mark this page as the homepage',
      },
    },
  ],
}

