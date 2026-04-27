import { tmdbFetch } from './client.ts'
import type { TmdbMovieResult, TmdbTvResult } from './types.ts'

export async function fetchMovieDetail(tmdbId: number): Promise<TmdbMovieResult> {
  return tmdbFetch<TmdbMovieResult>(`/movie/${tmdbId}?append_to_response=credits`)
}

export async function fetchTvDetail(tmdbId: number): Promise<TmdbTvResult> {
  return tmdbFetch<TmdbTvResult>(`/tv/${tmdbId}?append_to_response=credits`)
}
