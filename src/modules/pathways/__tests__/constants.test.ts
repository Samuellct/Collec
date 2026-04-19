import { describe, it, expect } from 'vitest'
import { PATHWAY_TYPES, ACCESSIBILITY_LEVELS } from '../constants.ts'

describe('PATHWAY_TYPES', () => {
  it('contains exactly 6 types', () => {
    expect(PATHWAY_TYPES).toHaveLength(6)
  })

  it('contains all expected slugs', () => {
    const slugs = PATHWAY_TYPES.map((t) => t.value)
    expect(slugs).toContain('historical')
    expect(slugs).toContain('author')
    expect(slugs).toContain('thematic')
    expect(slugs).toContain('national')
    expect(slugs).toContain('genre')
    expect(slugs).toContain('blockbuster')
  })

  it('every type has a non-empty label', () => {
    for (const t of PATHWAY_TYPES) {
      expect(t.label.length).toBeGreaterThan(0)
    }
  })
})

describe('ACCESSIBILITY_LEVELS (re-exported)', () => {
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
