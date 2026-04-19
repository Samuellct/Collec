import { tmdbFetch } from './client.ts'
import type { TmdbSearchMovieItem, TmdbSearchTvItem, TmdbSearchMultiItem } from './types.ts'

const MAX_QUERY_LENGTH = 200

function validateQuery(query: string): string {
  const trimmed = query.trim()
  if (!trimmed) throw new Error('Search query is empty')
  return trimmed.slice(0, MAX_QUERY_LENGTH)
}

export async function searchMovie(query: string): Promise<TmdbSearchMovieItem[]> {
  const q = validateQuery(query)
  const data = await tmdbFetch<{ results: TmdbSearchMovieItem[] }>('/search/movie', { query: q })
  return data.results
}

export async function searchTv(query: string): Promise<TmdbSearchTvItem[]> {
  const q = validateQuery(query)
  const data = await tmdbFetch<{ results: TmdbSearchTvItem[] }>('/search/tv', { query: q })
  return data.results
}

export async function searchMulti(query: string): Promise<TmdbSearchMultiItem[]> {
  const q = validateQuery(query)
  const data = await tmdbFetch<{ results: TmdbSearchMultiItem[] }>('/search/multi', { query: q })
  return data.results.filter(
    (item): item is TmdbSearchMultiItem =>
      item.media_type === 'movie' || item.media_type === 'tv',
  )
}
