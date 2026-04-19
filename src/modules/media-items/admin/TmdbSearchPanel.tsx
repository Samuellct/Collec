'use client'

import { useCallback, useRef, useState } from 'react'
import Image from 'next/image.js'
import { useRouter } from 'next/navigation.js'

interface TmdbResult {
  tmdb_id: number
  media_type: 'movie' | 'tv'
  title: string
  year: string | null
  poster_path: string | null
}

const POSTER_BASE = 'https://image.tmdb.org/t/p/w92'

export function TmdbSearchPanel() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TmdbResult[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/media-items/search-tmdb?q=${encodeURIComponent(q)}`,
        { credentials: 'include' },
      )
      if (!res.ok) throw new Error('Erreur de recherche')
      const data = (await res.json()) as { results: TmdbResult[] }
      setResults(data.results ?? [])
    } catch {
      setError('La recherche TMDB a échoué.')
    } finally {
      setLoading(false)
    }
  }, [])

  function handleInput(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void search(value)
    }, 300)
  }

  async function handleImport(result: TmdbResult) {
    setImporting(result.tmdb_id)
    setError(null)
    try {
      const res = await fetch('/api/media-items/import-tmdb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tmdbId: result.tmdb_id, mediaType: result.media_type }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      const data = (await res.json()) as { id: number | string }
      router.push(`/admin/collections/media-items/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'import")
    } finally {
      setImporting(null)
    }
  }

  return (
    <div
      style={{
        margin: '0 0 24px 0',
        padding: '16px',
        border: '1px solid #e0d9ce',
        borderRadius: '6px',
        background: '#faf7f2',
      }}
    >
      <p
        style={{
          margin: '0 0 10px 0',
          fontWeight: 600,
          fontSize: '13px',
          color: '#121417',
        }}
      >
        Importer depuis TMDB
      </p>
      <input
        type="text"
        placeholder="Titre du film ou de la série..."
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #d0c9bf',
          borderRadius: '4px',
          fontSize: '14px',
          boxSizing: 'border-box',
        }}
        aria-label="Recherche TMDB"
      />

      {loading && (
        <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#5E6772' }}>Recherche...</p>
      )}

      {error && (
        <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#B85C38' }}>{error}</p>
      )}

      {results.length > 0 && (
        <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none' }}>
          {results.map((r) => (
            <li
              key={`${r.media_type}-${r.tmdb_id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 0',
                borderBottom: '1px solid #e0d9ce',
              }}
            >
              {r.poster_path ? (
                <Image
                  src={`${POSTER_BASE}${r.poster_path}`}
                  alt=""
                  width={30}
                  height={45}
                  style={{ objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
                />
              ) : (
                <div
                  style={{
                    width: 30,
                    height: 45,
                    background: '#e0d9ce',
                    borderRadius: '2px',
                    flexShrink: 0,
                  }}
                />
              )}
              <span style={{ flex: 1, fontSize: '13px', color: '#121417' }}>
                {r.title}
                {r.year ? ` (${r.year})` : ''}
                <span style={{ marginLeft: 6, fontSize: '11px', color: '#5E6772' }}>
                  {r.media_type === 'movie' ? 'Film' : 'Série'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => void handleImport(r)}
                disabled={importing === r.tmdb_id}
                style={{
                  padding: '4px 10px',
                  background: importing === r.tmdb_id ? '#e0d9ce' : '#B85C38',
                  color: importing === r.tmdb_id ? '#5E6772' : '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: importing === r.tmdb_id ? 'default' : 'pointer',
                  flexShrink: 0,
                }}
              >
                {importing === r.tmdb_id ? '...' : 'Importer'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
