import { readFileSync } from 'fs'
import { resolve } from 'path'
import { COLLECTIONS } from './data/collections-seed.ts'
import type { CollectionDef, ItemDef } from './data/collections-seed.ts'

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local')
  try {
    const content = readFileSync(envPath, 'utf8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const value = trimmed.slice(eqIdx + 1).trim()
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // .env.local absent: rely on environment variables
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// Build a query string without encoding keys (Payload uses bracket notation)
function qs(params: Record<string, string | number>): string {
  return Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

async function apiGet<T>(base: string, path: string, token: string): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    headers: { Authorization: `JWT ${token}` },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GET ${path} → ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

async function apiPost<T>(base: string, path: string, token: string, body: unknown): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`POST ${path} → ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

async function apiPatch<T>(base: string, path: string, token: string, body: unknown): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PATCH ${path} → ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Domain helpers
// ---------------------------------------------------------------------------

async function login(base: string, email: string, password: string): Promise<string> {
  const data = await apiPost<{ token?: string }>(base, '/api/admins/login', '', {
    email,
    password,
  })
  if (!data.token) throw new Error('Login response missing token')
  return data.token
}

async function upsertCollection(
  base: string,
  token: string,
  col: CollectionDef,
): Promise<number> {
  const q = qs({ 'where[slug][equals]': col.slug, limit: 1 })
  const existing = await apiGet<{ docs: Array<{ id: number }> }>(
    base,
    `/api/collections?${q}`,
    token,
  )

  const payload = {
    slug: col.slug,
    title: col.title,
    short_description: col.short_description,
    ...(col.editorial_note ? { editorial_note: col.editorial_note } : {}),
    type: col.type,
    accessibility_level: col.accessibility_level,
    is_open: col.is_open,
    is_published: true,
    display_order: col.display_order,
  }

  if (existing.docs.length > 0) {
    const id = existing.docs[0]!.id
    await apiPatch(base, `/api/collections/${id}`, token, payload)
    return id
  }

  const created = await apiPost<{ doc: { id: number } }>(
    base,
    '/api/collections',
    token,
    payload,
  )
  return created.doc.id
}

async function searchTmdbId(
  base: string,
  token: string,
  item: ItemDef,
): Promise<number | null> {
  const q = qs({ q: item.title })
  const data = await apiGet<{
    results: Array<{ tmdb_id: number; media_type: string; year: string | null }>
  }>(base, `/api/media-items/search-tmdb?${q}`, token)

  const targetType = item.mediaType === 'movie' ? 'movie' : 'tv'
  const match = data.results.find(
    (r) =>
      r.media_type === targetType &&
      r.year !== null &&
      Math.abs(parseInt(r.year) - item.year) <= 1,
  )
  return match?.tmdb_id ?? null
}

async function importMediaItem(
  base: string,
  token: string,
  tmdbId: number,
  mediaType: 'movie' | 'tv',
): Promise<number> {
  const data = await apiPost<{ id: number }>(
    base,
    '/api/media-items/import-tmdb',
    token,
    { tmdbId, mediaType },
  )
  return data.id
}

async function linkToCollection(
  base: string,
  token: string,
  collectionId: number,
  mediaItemId: number,
): Promise<'added' | 'already_linked'> {
  const q = qs({
    'where[and][0][collection][equals]': collectionId,
    'where[and][1][media_item][equals]': mediaItemId,
    limit: 1,
  })
  const existing = await apiGet<{ docs: unknown[] }>(
    base,
    `/api/collection-items?${q}`,
    token,
  )
  if (existing.docs.length > 0) return 'already_linked'

  await apiPost(base, '/api/collection-items', token, {
    collection: collectionId,
    media_item: mediaItemId,
  })
  return 'added'
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run() {
  loadEnv()

  const base = (process.env.SEED_BASE_URL ?? 'http://localhost:3001').replace(/\/$/, '')
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env.local',
    )
  }

  console.log(`Connecting to ${base}...`)
  const token = await login(base, email, password)
  console.log('Authenticated.\n')

  const total = COLLECTIONS.length
  let globalAdded = 0
  let globalAlready = 0
  let globalErrors = 0

  for (let i = 0; i < COLLECTIONS.length; i++) {
    const col = COLLECTIONS[i]!
    process.stdout.write(`[${i + 1}/${total}] ${col.title} — `)

    let collectionId: number
    try {
      collectionId = await upsertCollection(base, token, col)
    } catch (err) {
      console.error(`FAILED (collection): ${err instanceof Error ? err.message : err}`)
      globalErrors += col.items.length
      continue
    }

    let added = 0
    let already = 0
    let errors = 0

    for (const item of col.items) {
      try {
        // Resolve TMDB ID
        let tmdbId = item.tmdbId
        if (!tmdbId) {
          await sleep(150)
          const found = await searchTmdbId(base, token, item)
          if (!found) {
            process.stdout.write('?')
            errors++
            continue
          }
          tmdbId = found
        }

        // Import media item via existing endpoint (full upsert with hooks)
        await sleep(150)
        const mediaItemId = await importMediaItem(base, token, tmdbId, item.mediaType)

        // Link to collection
        const status = await linkToCollection(base, token, collectionId, mediaItemId)
        if (status === 'added') {
          process.stdout.write('+')
          added++
        } else {
          process.stdout.write('.')
          already++
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        process.stdout.write('E')
        console.warn(`\n  [ERROR] "${item.title}" (${item.year}): ${msg}`)
        errors++
      }
    }

    console.log(
      ` — ${added} added, ${already} already linked, ${errors} errors`,
    )
    globalAdded += added
    globalAlready += already
    globalErrors += errors
  }

  const total_items = COLLECTIONS.reduce((sum, c) => sum + c.items.length, 0)
  console.log(
    `\nDone. ${total_items} items across ${total} collections.`,
  )
  console.log(
    `  ${globalAdded} added, ${globalAlready} already linked, ${globalErrors} errors/skipped.`,
  )
  if (globalErrors > 0) {
    console.log(
      '  Items with errors were skipped. Add their tmdbId to the dataset and rerun.',
    )
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
