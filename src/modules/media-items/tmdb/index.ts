export { tmdbFetch, TMDB_IMAGE_BASE } from './client.ts'
export { searchMovie, searchTv, searchMulti } from './search.ts'
export { fetchMovieDetail, fetchTvDetail } from './fetch-detail.ts'
export { normalizeMovie, normalizeTv } from './normalize.ts'
export { resolveCacheState } from './cache.ts'
export type { CacheState } from './cache.ts'
export { getWatchProviders } from './watch-providers.ts'
export type { WatchProviders } from './watch-providers.ts'
export type {
  TmdbMovieResult,
  TmdbTvResult,
  TmdbSearchMovieItem,
  TmdbSearchTvItem,
  TmdbSearchMultiItem,
  NormalizedMediaItem,
} from './types.ts'
