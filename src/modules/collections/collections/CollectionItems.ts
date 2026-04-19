import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../auth/access/is-admin.ts'

export const CollectionItems: CollectionConfig = {
  slug: 'collection-items',
  admin: {
    group: 'Éditorial',
    defaultColumns: ['collection', 'media_item'],
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  indexes: [
    {
      fields: ['collection', 'media_item'],
      unique: true,
    },
  ],
  fields: [
    {
      name: 'collection',
      type: 'relationship',
      relationTo: 'collections',
      required: true,
      hasMany: false,
      index: true,
    },
    {
      name: 'media_item',
      type: 'relationship',
      relationTo: 'media-items',
      required: true,
      hasMany: false,
    },
    {
      name: 'item_note',
      type: 'textarea',
      admin: {
        description: 'Note éditoriale sur l\'oeuvre dans cette collection.',
      },
    },
  ],
}
