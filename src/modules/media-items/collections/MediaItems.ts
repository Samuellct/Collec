import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../auth/access/is-admin.ts'
import { importTmdbEndpoint } from '../endpoints/import-tmdb.ts'
import { searchTmdbEndpoint } from '../endpoints/search-tmdb.ts'
import { backfillSlugsEndpoint } from '../endpoints/backfill-slugs.ts'

const COMBINING_DIACRITICS = /\p{M}/gu

function toSlug(title: string, year?: number | null): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return year ? `${base}-${year}` : base
}

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
  endpoints: [importTmdbEndpoint, searchTmdbEndpoint, backfillSlugsEndpoint],
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
        description: 'Titre FR. Modifiable manuellement - un re-sync TMDB écrasera cette valeur.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Identifiant URL unique. Auto-généré depuis le titre + année si vide.',
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ value, data }: { value?: string | null; data?: Record<string, unknown> }) => {
            if (!value && data) {
              return toSlug(
                (data.title as string) ?? '',
                (data.year as number | null | undefined) ?? null,
              )
            }
            return value ?? null
          },
        ],
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
        description: 'Synopsis. Modifiable manuellement - un re-sync TMDB écrasera cette valeur.',
      },
    },
    {
      name: 'poster_url',
      type: 'text',
      admin: {
        description:
          'URL absolue image.tmdb.org. Modifiable manuellement - un re-sync TMDB écrasera cette valeur.',
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
      name: 'director',
      type: 'text',
    },
    {
      name: 'cast',
      type: 'text',
      admin: {
        description: 'Acteurs principaux, séparés par virgule (10 max).',
      },
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
