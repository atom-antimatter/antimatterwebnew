import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'payload-users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'createdAt'],
    description: 'Manage CMS users - admins can create new users and assign roles',
  },
  access: {
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
    read: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: {
        description: 'Full name',
      },
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin (Full Access)', value: 'admin' },
        { label: 'Editor (Content Only)', value: 'editor' },
      ],
      required: true,
      defaultValue: 'editor',
      admin: {
        description: 'Admin = full CMS access. Editor = can only edit content',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'payload-media',
      admin: {
        description: 'Profile picture',
      },
    },
  ],
}

