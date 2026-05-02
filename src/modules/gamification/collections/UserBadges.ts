import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../auth/access/is-admin.ts'
import { isOwnProgress } from '../../progress/access/is-own-progress.ts'

export const UserBadges: CollectionConfig = {
  slug: 'user-badges',
  admin: {
    group: 'Gamification',
    defaultColumns: ['user', 'badge', 'earned_at'],
  },
  access: {
    read: isOwnProgress,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  indexes: [
    {
      fields: ['user', 'badge'],
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
      name: 'badge',
      type: 'relationship',
      relationTo: 'badges',
      required: true,
      hasMany: false,
      index: true,
    },
    {
      name: 'earned_at',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
  ],
}
