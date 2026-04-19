export interface TmdbMovieResult {
  id: number
  title: string
  original_title: string
  release_date: string
  overview: string
  poster_path: string | null
  imdb_id?: string
  runtime?: number
}

export interface TmdbTvResult {
  id: number
  name: string
  original_name: string
  first_air_date: string
  overview: string
  poster_path: string | null
  number_of_seasons?: number
}

export interface TmdbSearchMovieItem {
  id: number
  title: string
  original_title: string
  release_date: string
  poster_path: string | null
  media_type?: 'movie'
}

export interface TmdbSearchTvItem {
  id: number
  name: string
  original_name: string
  first_air_date: string
  poster_path: string | null
  media_type?: 'tv'
}

export type TmdbSearchMultiItem =
  | (TmdbSearchMovieItem & { media_type: 'movie' })
  | (TmdbSearchTvItem & { media_type: 'tv' })

export interface TmdbWatchProvidersResult {
  id: number
  results: Record<
    string,
    {
      link?: string
      flatrate?: TmdbWatchProvider[]
      rent?: TmdbWatchProvider[]
      buy?: TmdbWatchProvider[]
    }
  >
}

export interface TmdbWatchProvider {
  logo_path: string
  provider_id: number
  provider_name: string
  display_priority: number
}

export interface NormalizedMediaItem {
  title: string
  original_title: string
  year: number | null
  duration: number | null
  synopsis: string
  poster_url: string | null
  tmdb_id: number
  imdb_id: string | null
  source_of_truth: 'tmdb'
  source_last_synced_at: string
  source_expires_at: string
}
