import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../auth/access/is-admin.ts'
import { readPublishedOrAdmin } from '../../collections/access/read-published-or-admin.ts'
import { PATHWAY_TYPES, ACCESSIBILITY_LEVELS } from '../constants.ts'

export const Pathways: CollectionConfig = {
  slug: 'pathways',
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
        description: 'Identifiant URL unique, format kebab-case (ex: nouvelle-vague-naissance-cinema).',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'text',
      admin: {
        description: "Précise l'angle sans répéter le titre.",
      },
    },
    {
      name: 'introduction',
      type: 'textarea',
      required: true,
      admin: {
        description: "200 à 500 mots. Angle éditorial et promesse d'expérience.",
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: PATHWAY_TYPES.map((t) => ({ label: t.label, value: t.value })),
    },
    {
      name: 'accessibility_level',
      type: 'select',
      required: true,
      options: ACCESSIBILITY_LEVELS.map((l) => ({ label: l.label, value: l.value })),
      admin: {
        description: 'Niveau requis pour apprécier le parcours.',
      },
    },
    {
      name: 'estimated_duration_hours',
      type: 'number',
      admin: {
        description: 'Durée de visionnage totale estimée, en heures.',
      },
    },
    {
      name: 'linked_collection',
      type: 'relationship',
      relationTo: 'collections',
      hasMany: false,
      admin: {
        description: 'Collection directement liée à ce parcours.',
      },
    },
    {
      name: 'is_published',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Rendre le parcours visible sur le site public.',
      },
    },
    {
      name: 'display_order',
      type: 'number',
      defaultValue: 0,
      index: true,
    },
  ],
}
