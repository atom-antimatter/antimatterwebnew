import type { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'link', 'hidden', 'updatedAt'],
    description: 'Manage service offerings and their content',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'link',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL path for this service (e.g., /design-agency)',
      },
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'React icon component name (e.g., MdOutlineDesignServices)',
      },
    },
    {
      name: 'pageTitle',
      type: 'richText',
      admin: {
        description: 'Custom formatted title for the service page',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'tagline',
      type: 'array',
      fields: [
        {
          name: 'line',
          type: 'text',
        },
      ],
      admin: {
        description: 'Short tagline phrases',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Service Items',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'images',
          type: 'array',
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
      ],
    },
    {
      name: 'tools',
      type: 'array',
      fields: [
        {
          name: 'tool',
          type: 'text',
        },
      ],
      admin: {
        description: 'Technologies and tools used',
      },
    },
    {
      name: 'toolIcons',
      type: 'array',
      fields: [
        {
          name: 'iconName',
          type: 'text',
          admin: {
            description: 'React icon component name',
          },
        },
      ],
    },
    {
      name: 'hidden',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Hide from public navigation but keep in CMS',
      },
    },
    {
      name: 'customCTA',
      type: 'group',
      fields: [
        {
          name: 'text',
          type: 'text',
        },
        {
          name: 'href',
          type: 'text',
        },
        {
          name: 'secondary',
          type: 'group',
          fields: [
            {
              name: 'text',
              type: 'text',
            },
            {
              name: 'href',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
}

