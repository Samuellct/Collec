import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../auth/access/is-admin.ts'

export const ExternalIds: CollectionConfig = {
  slug: 'external-ids',
  admin: {
    useAsTitle: 'external_id',
    group: 'Catalogue',
    defaultColumns: ['provider', 'external_id', 'media_item'],
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  indexes: [
    {
      fields: ['provider', 'external_id'],
      unique: true,
    },
  ],
  fields: [
    {
      name: 'media_item',
      type: 'relationship',
      relationTo: 'media-items',
      required: true,
      hasMany: false,
    },
    {
      name: 'provider',
      type: 'select',
      required: true,
      options: [
        { label: 'TMDB', value: 'tmdb' },
        { label: 'IMDb', value: 'imdb' },
      ],
    },
    {
      name: 'external_id',
      type: 'text',
      required: true,
    },
  ],
}
