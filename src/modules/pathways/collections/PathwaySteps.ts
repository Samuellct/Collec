import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../auth/access/is-admin.ts'

export const PathwaySteps: CollectionConfig = {
  slug: 'pathway-steps',
  admin: {
    group: 'Éditorial',
    defaultColumns: ['pathway', 'position', 'media_item', 'step_title'],
  },
  defaultSort: 'position',
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  indexes: [
    {
      fields: ['pathway', 'position'],
      unique: true,
    },
    {
      fields: ['pathway', 'media_item'],
      unique: true,
    },
  ],
  fields: [
    {
      name: 'pathway',
      type: 'relationship',
      relationTo: 'pathways',
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
      name: 'position',
      type: 'number',
      required: true,
      min: 1,
      admin: {
        description: "Ordre de l'étape dans le parcours. Commence à 1. Fixe.",
      },
    },
    {
      name: 'step_title',
      type: 'text',
      admin: {
        description: "Titre éditorial de l'étape (ex : \"L'étincelle\" plutôt que le titre du film).",
      },
    },
    {
      name: 'step_editorial',
      type: 'textarea',
      required: true,
      admin: {
        description: "150 à 300 mots. Contexte, apport de l'oeuvre dans le parcours, ouverture sur la suite.",
      },
    },
    {
      name: 'step_context',
      type: 'textarea',
      admin: {
        description: 'Note factuelle optionnelle. 50 mots maximum.',
      },
    },
  ],
}
