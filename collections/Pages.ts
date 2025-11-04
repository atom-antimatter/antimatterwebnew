import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'payload-pages',
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
      name: 'template',
      type: 'select',
      options: [
        { label: 'Custom (Flexible Layout)', value: 'custom' },
        { label: 'Landing Page (Homepage Style)', value: 'landing' },
        { label: 'Service Page', value: 'service' },
        { label: 'Blog Post', value: 'blog' },
        { label: 'Case Study', value: 'case-study' },
        { label: 'Simple Content', value: 'simple' },
      ],
      defaultValue: 'custom',
      required: true,
      admin: {
        description: 'Choose a template for this page',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        {
          slug: 'hero',
          labels: { singular: 'Hero Section', plural: 'Hero Sections' },
          fields: [
            { name: 'heading', type: 'text', required: true },
            { name: 'subheading', type: 'textarea' },
            { name: 'ctaText', type: 'text' },
            { name: 'ctaLink', type: 'text' },
            { name: 'backgroundVideo', type: 'upload', relationTo: 'payload-media' },
            { name: 'showParticles', type: 'checkbox', defaultValue: true },
          ],
        },
        {
          slug: 'richText',
          labels: { singular: 'Rich Text', plural: 'Rich Text Blocks' },
          fields: [
            { name: 'content', type: 'richText', required: true },
          ],
        },
        {
          slug: 'services',
          labels: { singular: 'Services Grid', plural: 'Services Grids' },
          fields: [
            { name: 'heading', type: 'text' },
            { name: 'services', type: 'relationship', relationTo: 'payload-services', hasMany: true },
            { name: 'columns', type: 'select', options: ['2', '3', '4'], defaultValue: '3' },
          ],
        },
        {
          slug: 'testimonials',
          labels: { singular: 'Testimonials', plural: 'Testimonials' },
          fields: [
            { name: 'heading', type: 'text' },
            { name: 'style', type: 'select', options: ['grid', 'carousel', 'bento'], defaultValue: 'bento' },
          ],
        },
        {
          slug: 'cta',
          labels: { singular: 'Call to Action', plural: 'CTAs' },
          fields: [
            { name: 'heading', type: 'text', required: true },
            { name: 'description', type: 'textarea' },
            { name: 'primaryButton', type: 'text' },
            { name: 'primaryLink', type: 'text' },
            { name: 'secondaryButton', type: 'text' },
            { name: 'secondaryLink', type: 'text' },
          ],
        },
        {
          slug: 'workShowcase',
          labels: { singular: 'Work Showcase', plural: 'Work Showcases' },
          fields: [
            { name: 'heading', type: 'text' },
            { name: 'showAllWork', type: 'checkbox', defaultValue: true },
          ],
        },
        {
          slug: 'clients',
          labels: { singular: 'Clients Section', plural: 'Clients Sections' },
          fields: [
            { name: 'heading', type: 'text', defaultValue: 'Trusted by Industry Leaders' },
          ],
        },
      ],
      admin: {
        description: 'Build your page with flexible sections',
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
      relationTo: 'payload-pages',
      admin: {
        description: 'Create hierarchical page structure',
      },
    },
    {
      name: 'internalLinks',
      type: 'relationship',
      relationTo: 'payload-pages',
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
          relationTo: 'payload-media',
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
          relationTo: 'payload-media',
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

