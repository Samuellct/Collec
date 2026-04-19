import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../auth/access/is-admin.ts'
import { importTmdbEndpoint } from '../endpoints/import-tmdb.ts'
import { searchTmdbEndpoint } from '../endpoints/search-tmdb.ts'

export const MediaItems: CollectionConfig = {
  slug: 'media-items',
  admin: {
    useAsTitle: 'title',
    group: 'Catalogue',
    defaultColumns: ['title', 'year', 'media_type', 'source_last_synced_at'],
    components: {
      beforeList: ['@/modules/media-items/admin/TmdbSearchPanel#TmdbSearchPanel'],
    },
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  endpoints: [importTmdbEndpoint, searchTmdbEndpoint],
  indexes: [
    {
      fields: ['tmdb_id', 'media_type'],
      unique: true,
    },
  ],
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Titre FR. Modifiable manuellement — un re-sync TMDB écrasera cette valeur.',
      },
    },
    {
      name: 'original_title',
      type: 'text',
    },
    {
      name: 'year',
      type: 'number',
    },
    {
      name: 'release_date',
      type: 'date',
      admin: {
        description: 'Date de sortie (AAAA-MM-JJ). Utilisée pour le tri chronologique dans les collections.',
      },
    },
    {
      name: 'duration',
      type: 'number',
      admin: {
        description: 'Minutes pour les films, nombre de saisons pour les séries.',
      },
    },
    {
      name: 'synopsis',
      type: 'textarea',
      admin: {
        description: 'Synopsis. Modifiable manuellement — un re-sync TMDB écrasera cette valeur.',
      },
    },
    {
      name: 'poster_url',
      type: 'text',
      admin: {
        description:
          'URL absolue image.tmdb.org. Modifiable manuellement — un re-sync TMDB écrasera cette valeur.',
      },
    },
    {
      name: 'media_type',
      type: 'relationship',
      relationTo: 'media-types',
      required: true,
      hasMany: false,
    },
    {
      name: 'tmdb_id',
      type: 'number',
      index: true,
    },
    {
      name: 'imdb_id',
      type: 'text',
    },
    {
      name: 'source_of_truth',
      type: 'select',
      options: [{ label: 'TMDB', value: 'tmdb' }],
      defaultValue: 'tmdb',
    },
    {
      name: 'source_last_synced_at',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        readOnly: true,
      },
    },
    {
      name: 'source_expires_at',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        readOnly: true,
      },
    },
  ],
}
