import { describe, it, expect } from 'vitest'
import { COLLECTION_TYPES, ACCESSIBILITY_LEVELS } from '../constants.ts'

describe('COLLECTION_TYPES', () => {
  it('contains exactly 10 types', () => {
    expect(COLLECTION_TYPES).toHaveLength(10)
  })

  it('contains all expected slugs', () => {
    const slugs = COLLECTION_TYPES.map((t) => t.value)
    expect(slugs).toContain('filmography_complete')
    expect(slugs).toContain('filmography_studio')
    expect(slugs).toContain('saga')
    expect(slugs).toContain('franchise')
    expect(slugs).toContain('movement')
    expect(slugs).toContain('subgenre')
    expect(slugs).toContain('prize_complete')
    expect(slugs).toContain('prize_edition')
    expect(slugs).toContain('national_cinema')
    expect(slugs).toContain('thematic')
  })

  it('every type has a non-empty label', () => {
    for (const t of COLLECTION_TYPES) {
      expect(t.label.length).toBeGreaterThan(0)
    }
  })
})

describe('ACCESSIBILITY_LEVELS', () => {
  it('contains exactly 3 levels', () => {
    expect(ACCESSIBILITY_LEVELS).toHaveLength(3)
  })

  it('contains accessible, curieux, cinephile', () => {
    const values = ACCESSIBILITY_LEVELS.map((l) => l.value)
    expect(values).toContain('accessible')
    expect(values).toContain('curieux')
    expect(values).toContain('cinephile')
  })
})
