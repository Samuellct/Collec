import { describe, it, expect } from 'vitest'
import { resolveCacheState } from '../tmdb/cache.ts'

const now = new Date('2026-04-19T12:00:00Z')

describe('resolveCacheState', () => {
  it('returns absent when source_last_synced_at is null', () => {
    expect(resolveCacheState({ source_last_synced_at: null, source_expires_at: null }, now)).toBe('absent')
  })

  it('returns absent when source_expires_at is missing', () => {
    expect(resolveCacheState({ source_last_synced_at: '2026-01-01T00:00:00Z', source_expires_at: null }, now)).toBe('absent')
  })

  it('returns fresh when expires_at is in the future', () => {
    const future = new Date(now.getTime() + 1000 * 60 * 60).toISOString()
    expect(resolveCacheState({ source_last_synced_at: '2026-04-18T00:00:00Z', source_expires_at: future }, now)).toBe('fresh')
  })

  it('returns expired when expires_at is in the past', () => {
    const past = new Date(now.getTime() - 1000).toISOString()
    expect(resolveCacheState({ source_last_synced_at: '2025-10-19T00:00:00Z', source_expires_at: past }, now)).toBe('expired')
  })
})
