import { ACCESSIBILITY_LEVELS } from '../collections/constants.ts'

export { ACCESSIBILITY_LEVELS }

export const PATHWAY_TYPES = [
  { label: 'Chronologie historique', value: 'historical' },
  { label: "Traversée d'un auteur", value: 'author' },
  { label: 'Angle thématique', value: 'thematic' },
  { label: 'Cinéma national', value: 'national' },
  { label: 'Genre ou sous-genre', value: 'genre' },
  { label: 'Blockbusters structurants', value: 'blockbuster' },
] as const

export type PathwayTypeValue = (typeof PATHWAY_TYPES)[number]['value']
