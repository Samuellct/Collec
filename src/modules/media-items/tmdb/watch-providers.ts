import { tmdbFetch } from './client.ts'
import type { TmdbWatchProvidersResult, TmdbWatchProvider } from './types.ts'

export interface WatchProviders {
  flatrate: TmdbWatchProvider[]
  rent: TmdbWatchProvider[]
  buy: TmdbWatchProvider[]
  link?: string
}

export async function getWatchProviders(
  tmdbId: number,
  mediaType: 'movie' | 'tv',
  country = 'FR',
): Promise<WatchProviders | null> {
  const endpoint = mediaType === 'movie' ? `/movie/${tmdbId}/watch/providers` : `/tv/${tmdbId}/watch/providers`
  const data = await tmdbFetch<TmdbWatchProvidersResult>(endpoint)
  const countryData = data.results[country]
  if (!countryData) return null

  return {
    flatrate: countryData.flatrate ?? [],
    rent: countryData.rent ?? [],
    buy: countryData.buy ?? [],
    link: countryData.link,
  }
}
