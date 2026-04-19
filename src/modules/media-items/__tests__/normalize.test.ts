import { describe, it, expect, beforeEach, vi } from 'vitest'
import { normalizeMovie, normalizeTv } from '../tmdb/normalize.ts'
import type { TmdbMovieResult, TmdbTvResult } from '../tmdb/types.ts'

const movieFixture: TmdbMovieResult = {
  id: 438631,
  title: 'Dune',
  original_title: 'Dune',
  release_date: '2021-09-15',
  overview: 'Un jeune noble...',
  poster_path: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
  imdb_id: 'tt1160419',
  runtime: 155,
}

const tvFixture: TmdbTvResult = {
  id: 1396,
  name: 'Breaking Bad',
  original_name: 'Breaking Bad',
  first_air_date: '2008-01-20',
  overview: "Un professeur de chimie...",
  poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
  number_of_seasons: 5,
}

describe('normalizeMovie', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-19T00:00:00Z'))
  })

  it('maps tmdb movie to NormalizedMediaItem', () => {
    const result = normalizeMovie(movieFixture)
    expect(result.title).toBe('Dune')
    expect(result.original_title).toBe('Dune')
    expect(result.year).toBe(2021)
    expect(result.duration).toBe(155)
    expect(result.synopsis).toBe('Un jeune noble...')
    expect(result.poster_url).toBe('https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg')
    expect(result.tmdb_id).toBe(438631)
    expect(result.imdb_id).toBe('tt1160419')
    expect(result.release_date).toBe('2021-09-15')
    expect(result.source_of_truth).toBe('tmdb')
  })

  it('sets source_expires_at to 180 days in the future', () => {
    const result = normalizeMovie(movieFixture)
    const syncedAt = new Date(result.source_last_synced_at)
    const expiresAt = new Date(result.source_expires_at)
    const diffDays = (expiresAt.getTime() - syncedAt.getTime()) / (1000 * 60 * 60 * 24)
    expect(diffDays).toBe(180)
  })

  it('handles missing poster', () => {
    const result = normalizeMovie({ ...movieFixture, poster_path: null })
    expect(result.poster_url).toBeNull()
  })

  it('handles missing release_date', () => {
    const result = normalizeMovie({ ...movieFixture, release_date: '' })
    expect(result.year).toBeNull()
    expect(result.release_date).toBeNull()
  })
})

describe('normalizeTv', () => {
  it('maps tmdb tv to NormalizedMediaItem', () => {
    const result = normalizeTv(tvFixture)
    expect(result.title).toBe('Breaking Bad')
    expect(result.original_title).toBe('Breaking Bad')
    expect(result.year).toBe(2008)
    expect(result.duration).toBe(5)
    expect(result.synopsis).toBe("Un professeur de chimie...")
    expect(result.poster_url).toBe('https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg')
    expect(result.tmdb_id).toBe(1396)
    expect(result.imdb_id).toBeNull()
    expect(result.release_date).toBe('2008-01-20')
    expect(result.source_of_truth).toBe('tmdb')
  })
})
