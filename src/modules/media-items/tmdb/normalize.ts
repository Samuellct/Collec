import { TMDB_IMAGE_BASE } from './client.ts'
import type { TmdbMovieResult, TmdbTvResult, NormalizedMediaItem } from './types.ts'

const EXPIRATION_DAYS = 180

function expiresAt(from: Date): string {
  const d = new Date(from)
  d.setDate(d.getDate() + EXPIRATION_DAYS)
  return d.toISOString()
}

function extractYear(dateStr: string | undefined): number | null {
  if (!dateStr) return null
  const year = parseInt(dateStr.slice(0, 4), 10)
  return isNaN(year) ? null : year
}

const MAX_CAST = 10

function extractDirectorFromMovie(detail: TmdbMovieResult): string | null {
  const director = detail.credits?.crew.find((m) => m.job === 'Director')
  return director?.name ?? null
}

function extractDirectorFromTv(detail: TmdbTvResult): string | null {
  if (detail.created_by && detail.created_by.length > 0) {
    return detail.created_by[0]!.name
  }
  return null
}

function extractCast(credits: { cast: Array<{ name: string; order: number }> } | undefined): string | null {
  if (!credits || credits.cast.length === 0) return null
  return credits.cast
    .slice(0, MAX_CAST)
    .map((m) => m.name)
    .join(', ')
}

export function normalizeMovie(detail: TmdbMovieResult): NormalizedMediaItem {
  const now = new Date()
  return {
    title: detail.title,
    original_title: detail.original_title,
    year: extractYear(detail.release_date),
    release_date: detail.release_date || null,
    duration: detail.runtime ?? null,
    synopsis: detail.overview,
    poster_url: detail.poster_path ? `${TMDB_IMAGE_BASE}${detail.poster_path}` : null,
    tmdb_id: detail.id,
    imdb_id: detail.imdb_id ?? null,
    director: extractDirectorFromMovie(detail),
    cast: extractCast(detail.credits),
    source_of_truth: 'tmdb',
    source_last_synced_at: now.toISOString(),
    source_expires_at: expiresAt(now),
  }
}

export function normalizeTv(detail: TmdbTvResult): NormalizedMediaItem {
  const now = new Date()
  return {
    title: detail.name,
    original_title: detail.original_name,
    year: extractYear(detail.first_air_date),
    release_date: detail.first_air_date || null,
    duration: detail.number_of_seasons ?? null,
    synopsis: detail.overview,
    poster_url: detail.poster_path ? `${TMDB_IMAGE_BASE}${detail.poster_path}` : null,
    tmdb_id: detail.id,
    imdb_id: null,
    director: extractDirectorFromTv(detail),
    cast: extractCast(detail.credits),
    source_of_truth: 'tmdb',
    source_last_synced_at: now.toISOString(),
    source_expires_at: expiresAt(now),
  }
}
