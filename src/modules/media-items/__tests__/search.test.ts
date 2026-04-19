import { describe, it, expect, vi, afterEach } from 'vitest'
import { searchMovie } from '../tmdb/search.ts'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('searchMovie', () => {
  it('calls the correct TMDB endpoint with the query and api_key', async () => {
    process.env.TMDB_API_KEY = 'test-key-123'

    const mockResults = [
      { id: 1, title: 'Dune', original_title: 'Dune', release_date: '2021-09-15', poster_path: '/abc.jpg' },
    ]

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: mockResults }),
    }))

    const results = await searchMovie('Dune')

    expect(results).toHaveLength(1)
    expect(results[0]?.title).toBe('Dune')

    const fetchCall = vi.mocked(fetch).mock.calls[0]
    const calledUrl = fetchCall?.[0] as string
    expect(calledUrl).toContain('/search/movie')
    expect(calledUrl).toContain('query=Dune')
    expect(calledUrl).toContain('api_key=test-key-123')
  })

  it('trims and truncates query before sending', async () => {
    process.env.TMDB_API_KEY = 'test-key'

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    }))

    await searchMovie('  Dune  ')

    const calledUrl = vi.mocked(fetch).mock.calls[0]?.[0] as string
    expect(calledUrl).toContain('query=Dune')
    expect(calledUrl).not.toContain('query=++Dune++')
  })

  it('throws when query is empty', async () => {
    await expect(searchMovie('   ')).rejects.toThrow('Search query is empty')
  })
})
