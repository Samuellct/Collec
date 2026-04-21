import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../auth/access/is-admin.ts'
import { readPublishedOrAdmin } from '../access/read-published-or-admin.ts'
import { COLLECTION_TYPES, ACCESSIBILITY_LEVELS } from '../constants.ts'

export const Collections: CollectionConfig = {
  slug: 'collections',
  admin: {
    useAsTitle: 'title',
    group: 'Éditorial',
    defaultColumns: ['title', 'type', 'accessibility_level', 'is_published', 'display_order'],
  },
  access: {
    read: readPublishedOrAdmin,
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
      index: true,
      admin: {
        description: 'Identifiant URL unique, format kebab-case (ex: filmographie-villeneuve).',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'short_description',
      type: 'text',
      required: true,
      validate: (val: string | null | undefined) => {
        if (!val) return 'Ce champ est requis.'
        if (val.length > 140) return `Maximum 140 caractères (actuel : ${val.length}).`
        return true
      },
      admin: {
        description: 'Courte description affichée dans le listing. 140 caractères maximum.',
      },
    },
    {
      name: 'editorial_note',
      type: 'textarea',
      admin: {
        description:
          'Note éditoriale longue. Recommandée pour les collections non factuelles (mouvements, thématiques).',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: COLLECTION_TYPES.map((t) => ({ label: t.label, value: t.value })),
    },
    {
      name: 'accessibility_level',
      type: 'select',
      required: true,
      options: ACCESSIBILITY_LEVELS.map((l) => ({ label: l.label, value: l.value })),
      admin: {
        description: 'Niveau requis pour apprécier la collection.',
      },
    },
    {
      name: 'cover_image_url',
      type: 'text',
      admin: {
        description: 'URL absolue de l\'image de couverture.',
      },
    },
    {
      name: 'is_open',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Collection ouverte (ajout continu d\'oeuvres) vs fermée (figée).',
      },
    },
    {
      name: 'is_published',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Rendre la collection visible sur le site public.',
      },
    },
    {
      name: 'linked_pathway',
      type: 'relationship',
      relationTo: 'pathways',
      hasMany: false,
      admin: {
        description: 'Parcours directement lié à cette collection.',
      },
    },
    {
      name: 'display_order',
      type: 'number',
      defaultValue: 0,
      index: true,
    },
    {
      name: 'items',
      type: 'join',
      collection: 'collection-items',
      on: 'collection',
      admin: {
        defaultColumns: ['media_item', 'item_note'],
      },
    },
  ],
}
