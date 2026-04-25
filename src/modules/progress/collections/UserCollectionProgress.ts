import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../auth/access/is-admin.ts'
import { isOwnProgress } from '../access/is-own-progress.ts'

export const UserCollectionProgress: CollectionConfig = {
  slug: 'user-collection-progress',
  admin: {
    group: 'Progression',
    defaultColumns: ['user', 'collection', 'percentage', 'is_completed'],
  },
  access: {
    read: isOwnProgress,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  indexes: [
    {
      fields: ['user', 'collection'],
      unique: true,
    },
  ],
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      hasMany: false,
      index: true,
    },
    {
      name: 'collection',
      type: 'relationship',
      relationTo: 'collections',
      required: true,
      hasMany: false,
      index: true,
    },
    {
      name: 'items_seen',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'items_total',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'percentage',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      max: 100,
    },
    {
      name: 'is_completed',
      type: 'checkbox',
      required: true,
      defaultValue: false,
    },
    {
      name: 'completed_at',
      type: 'date',
    },
  ],
}
