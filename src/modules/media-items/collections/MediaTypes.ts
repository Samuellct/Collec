import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../auth/access/is-admin.ts'

export const MediaTypes: CollectionConfig = {
  slug: 'media-types',
  admin: {
    useAsTitle: 'label',
    group: 'Catalogue',
    defaultColumns: ['slug', 'label', 'display_order'],
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Identifiant stable, ne pas modifier après création.',
        readOnly: true,
      },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        description: 'Libellé affiché (ex: Film, Série)',
      },
    },
    {
      name: 'display_order',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
