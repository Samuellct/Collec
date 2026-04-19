import type { Endpoint } from 'payload'
import { searchMulti } from '../tmdb/search.ts'

export const searchTmdbEndpoint: Endpoint = {
  path: '/search-tmdb',
  method: 'get',
  handler: async (req) => {
    if (req.user?.collection !== 'admins') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const url = new URL(req.url ?? '')
    const q = url.searchParams.get('q') ?? ''

    if (!q.trim()) {
      return Response.json({ results: [] })
    }

    try {
      const results = await searchMulti(q)
      const normalized = results.slice(0, 10).map((item) => {
        if (item.media_type === 'movie') {
          return {
            tmdb_id: item.id,
            media_type: 'movie' as const,
            title: item.title,
            year: item.release_date ? item.release_date.slice(0, 4) : null,
            poster_path: item.poster_path,
          }
        }
        return {
          tmdb_id: item.id,
          media_type: 'tv' as const,
          title: item.name,
          year: item.first_air_date ? item.first_air_date.slice(0, 4) : null,
          poster_path: item.poster_path,
        }
      })
      return Response.json({ results: normalized })
    } catch {
      return Response.json({ error: 'TMDB search failed' }, { status: 502 })
    }
  },
}
