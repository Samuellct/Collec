import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../auth/access/is-admin.ts'
import { isOwnProgress } from '../access/is-own-progress.ts'

export const UserPathwayProgress: CollectionConfig = {
  slug: 'user-pathway-progress',
  admin: {
    group: 'Progression',
    defaultColumns: ['user', 'pathway', 'percentage', 'is_completed'],
  },
  access: {
    read: isOwnProgress,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  indexes: [
    {
      fields: ['user', 'pathway'],
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
      name: 'pathway',
      type: 'relationship',
      relationTo: 'pathways',
      required: true,
      hasMany: false,
      index: true,
    },
    {
      name: 'steps_completed',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'steps_total',
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
