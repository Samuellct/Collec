const TMDB_BASE = 'https://api.themoviedb.org/3'

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY
  if (!key) throw new Error('TMDB_API_KEY is not set')
  return key
}

export async function tmdbFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`)
  url.searchParams.set('api_key', getApiKey())
  url.searchParams.set('language', 'fr-FR')

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  const res = await fetch(url.toString())

  if (!res.ok) {
    throw new Error(`TMDB fetch error: ${res.status} ${res.statusText} — ${path}`)
  }

  return res.json() as Promise<T>
}

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
