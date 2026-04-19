export const COLLECTION_TYPES = [
  { label: 'Filmographie complète', value: 'filmography_complete' },
  { label: 'Filmographie studio', value: 'filmography_studio' },
  { label: 'Saga', value: 'saga' },
  { label: 'Franchise', value: 'franchise' },
  { label: 'Mouvement', value: 'movement' },
  { label: 'Sous-genre', value: 'subgenre' },
  { label: 'Prix complet', value: 'prize_complete' },
  { label: 'Édition de prix', value: 'prize_edition' },
  { label: 'Cinéma national', value: 'national_cinema' },
  { label: 'Thématique', value: 'thematic' },
] as const

export const ACCESSIBILITY_LEVELS = [
  { label: 'Accessible', value: 'accessible' },
  { label: 'Curieux', value: 'curieux' },
  { label: 'Cinéphile', value: 'cinephile' },
] as const

export type CollectionTypeValue = (typeof COLLECTION_TYPES)[number]['value']
export type AccessibilityLevelValue = (typeof ACCESSIBILITY_LEVELS)[number]['value']
