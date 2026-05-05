import type { CollectionConfig } from 'payload'
import { isAdmin } from '../../auth/access/is-admin.ts'

export const Badges: CollectionConfig = {
  slug: 'badges',
  admin: {
    useAsTitle: 'title',
    group: 'Gamification',
    defaultColumns: ['slug', 'title', 'condition_type'],
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
      access: {
        update: () => false,
      },
      admin: {
        description: 'Identifiant stable, ne pas modifier après création.',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'icon_url',
      type: 'text',
      admin: {
        description: 'URL de l\'icône du badge (chemin public ou URL externe).',
      },
    },
    {
      name: 'condition_type',
      type: 'select',
      required: true,
      options: [
        { label: 'Première collection terminée', value: 'first_collection' },
        { label: 'Premier parcours terminé', value: 'first_pathway' },
        { label: 'Jalon : 10 œuvres vues', value: 'milestone_10' },
        { label: 'Jalon : 50 œuvres vues', value: 'milestone_50' },
        { label: 'Jalon : 100 œuvres vues', value: 'milestone_100' },
        { label: 'Jalon : 250 œuvres vues', value: 'milestone_250' },
        { label: 'Jalon : 500 œuvres vues', value: 'milestone_500' },
      ],
    },
  ],
}
