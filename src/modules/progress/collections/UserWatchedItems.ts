import type { CollectionConfig } from 'payload'
import { isOwnProgress } from '../access/is-own-progress.ts'
import { afterWatchChange, afterWatchDelete } from '../hooks/recalculate-on-watch-change.ts'

export const UserWatchedItems: CollectionConfig = {
  slug: 'user-watched-items',
  admin: {
    group: 'Progression',
    defaultColumns: ['user', 'media_item', 'watched_at'],
  },
  access: {
    create: ({ req }) => {
      if (!req.user) return false
      return req.user.collection === 'customers' || req.user.collection === 'admins'
    },
    read: isOwnProgress,
    update: isOwnProgress,
    delete: isOwnProgress,
  },
  indexes: [
    {
      fields: ['user', 'media_item'],
      unique: true,
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user?.collection === 'customers' && data) {
          data.user = req.user.id
        }
        return data
      },
    ],
    afterChange: [afterWatchChange],
    afterDelete: [afterWatchDelete],
  },
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
      name: 'media_item',
      type: 'relationship',
      relationTo: 'media-items',
      required: true,
      hasMany: false,
      index: true,
    },
    {
      name: 'watched_at',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: 'Date de visionnage saisie par l\'utilisateur.',
      },
    },
  ],
}
