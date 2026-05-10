import { readFileSync } from 'fs'
import { resolve } from 'path'
import { COLLECTIONS } from './data/collections-seed.ts'
import type { CollectionDef, ItemDef } from './data/collections-seed.ts'

// Collections dont les médias doivent être importés depuis TMDB (IDs corrigés par l'utilisateur).
// Toutes les autres collections : les médias sont déjà en base, on fait du lookup seul.
const IMPORT_SLUGS = new Set([
  'palme-dor-integrale',
  'oscar-meilleur-film-integrale',
  'scorsese-integrale',
  'miyazaki-integrale',
  'pixar-integrale',
  'trilogie-parrain',
  'univers-terre-du-milieu',
  'univers-harry-potter',
  'mission-impossible',
  'nouvelle-vague-10-essentiels',
  'new-hollywood-10-fondateurs',
  'cinema-coreen-essentiels',
  'films-adolescence',
  'cinema-espace-10-films',
])

// Collections ignorées par ce script.
const SKIP_SLUGS = new Set(['cinema-memes-pantheon'])

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

async function upsertCollection(base: string, token: string, col: CollectionDef): Promise<number> {
  // Lookup by current slug first, then former slug (migration)
  let id: number | null = null

  const bySlug = await apiGet<{ docs: Array<{ id: number }> }>(
    base,
    `/api/collections?${qs({ 'where[slug][equals]': col.slug, limit: 1 })}`,
    token,
  )
  if (bySlug.docs.length > 0) {
    id = bySlug.docs[0]!.id
  } else if (col.formerSlug) {
    const byFormer = await apiGet<{ docs: Array<{ id: number }> }>(
      base,
      `/api/collections?${qs({ 'where[slug][equals]': col.formerSlug, limit: 1 })}`,
      token,
    )
    if (byFormer.docs.length > 0) {
      id = byFormer.docs[0]!.id
      console.log(`  (migrating slug: ${col.formerSlug} → ${col.slug})`)
    }
  }

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

  if (id !== null) {
    await apiPatch(base, `/api/collections/${id}`, token, payload)
    return id
  }

  const created = await apiPost<{ doc: { id: number } }>(base, '/api/collections', token, payload)
  return created.doc.id
}

// Résout les slugs media-types ('film', 'series') en IDs numériques Payload.
// media_type est une relationship, donc les filtres where exigent un ID, pas un slug.
async function loadMediaTypeIds(
  base: string,
  token: string,
): Promise<{ movie: number; tv: number }> {
  const [filmRes, seriesRes] = await Promise.all([
    apiGet<{ docs: Array<{ id: number }> }>(
      base,
      `/api/media-types?${qs({ 'where[slug][equals]': 'film', limit: 1 })}`,
      token,
    ),
    apiGet<{ docs: Array<{ id: number }> }>(
      base,
      `/api/media-types?${qs({ 'where[slug][equals]': 'series', limit: 1 })}`,
      token,
    ),
  ])

  if (filmRes.docs.length === 0 || seriesRes.docs.length === 0) {
    throw new Error(
      'media-types introuvables en base. Lance d\'abord : pnpm exec tsx src/modules/media-items/seed/media-types.ts',
    )
  }

  return { movie: filmRes.docs[0]!.id, tv: seriesRes.docs[0]!.id }
}

// Cherche un média en base par tmdb_id + media_type (ID numérique).
async function findByTmdbId(
  base: string,
  token: string,
  tmdbId: number,
  mediaTypeId: number,
): Promise<number | null> {
  const q = qs({
    'where[and][0][tmdb_id][equals]': tmdbId,
    'where[and][1][media_type][equals]': mediaTypeId,
    limit: 1,
  })
  const data = await apiGet<{ docs: Array<{ id: number }> }>(base, `/api/media-items?${q}`, token)
  return data.docs[0]?.id ?? null
}

// Cherche un média en base par original_title exact + media_type (ID numérique).
// Fallback pour les items importés avec un titre FR mais dont l'original_title est en anglais.
async function findByOriginalTitle(
  base: string,
  token: string,
  title: string,
  mediaTypeId: number,
  year: number,
): Promise<number | null> {
  const q = qs({
    'where[and][0][original_title][equals]': title,
    'where[and][1][media_type][equals]': mediaTypeId,
    limit: 10,
  })
  const data = await apiGet<{ docs: Array<{ id: number; release_year?: number; year?: number }> }>(
    base,
    `/api/media-items?${q}`,
    token,
  )
  if (data.docs.length === 0) return null
  if (data.docs.length === 1) return data.docs[0]!.id

  const match = data.docs.find((d) => (d.release_year ?? d.year) === year)
  if (match) return match.id

  process.stdout.write(`[ambiguous original_title "${title}", took first result] `)
  return data.docs[0]!.id
}

// Cherche un média en base par titre exact + media_type (ID numérique).
// En cas de résultats multiples (ex. "Daredevil" 2015 et 2025), filtre par année si disponible.
async function findByTitle(
  base: string,
  token: string,
  title: string,
  mediaTypeId: number,
  year: number,
): Promise<number | null> {
  const q = qs({
    'where[and][0][title][equals]': title,
    'where[and][1][media_type][equals]': mediaTypeId,
    limit: 10,
  })
  const data = await apiGet<{ docs: Array<{ id: number; release_year?: number; year?: number }> }>(
    base,
    `/api/media-items?${q}`,
    token,
  )
  if (data.docs.length === 0) return null
  if (data.docs.length === 1) return data.docs[0]!.id

  // Plusieurs résultats : on tente de discriminer par année
  const match = data.docs.find((d) => (d.release_year ?? d.year) === year)
  if (match) return match.id

  // Aucune discrimination possible : on prend le premier et on avertit
  process.stdout.write(`[ambiguous title "${title}", took first result] `)
  return data.docs[0]!.id
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
  const data = await apiPost<{ id: number }>(base, '/api/media-items/import-tmdb', token, {
    tmdbId,
    mediaType,
  })
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
  const existing = await apiGet<{ docs: unknown[] }>(base, `/api/collection-items?${q}`, token)
  if (existing.docs.length > 0) return 'already_linked'

  await apiPost(base, '/api/collection-items', token, {
    collection: collectionId,
    media_item: mediaItemId,
  })
  return 'added'
}

// ---------------------------------------------------------------------------
// Résolution d'un média : lookup en base, puis import si autorisé
// ---------------------------------------------------------------------------

async function resolveMediaItem(
  base: string,
  token: string,
  item: ItemDef,
  canImport: boolean,
  mediaTypeIds: { movie: number; tv: number },
): Promise<number | null> {
  const mediaTypeId = mediaTypeIds[item.mediaType]

  // 0. Payload ID direct (bypass total — fiable même si tmdb_id est null en base)
  if (item.payloadId) {
    const data = await apiGet<{ id?: number }>(base, `/api/media-items/${item.payloadId}`, token)
    if (data.id) return data.id
    process.stdout.write(`[payloadId ${item.payloadId} introuvable] `)
  }

  // 1. Lookup par tmdbId (si fourni dans le seed)
  if (item.tmdbId) {
    await sleep(100)
    const id = await findByTmdbId(base, token, item.tmdbId, mediaTypeId)
    if (id !== null) return id
  }

  // 2. Lookup par titre exact (champ title)
  await sleep(100)
  const idByTitle = await findByTitle(base, token, item.title, mediaTypeId, item.year)
  if (idByTitle !== null) return idByTitle

  // 3. Lookup par original_title (items importés avec titre FR, original_title EN)
  await sleep(100)
  const idByOriginal = await findByOriginalTitle(base, token, item.title, mediaTypeId, item.year)
  if (idByOriginal !== null) return idByOriginal

  // 4. Import depuis TMDB (uniquement pour les collections autorisées)
  if (!canImport) return null

  let tmdbId = item.tmdbId
  if (!tmdbId) {
    await sleep(150)
    const found = await searchTmdbId(base, token, item)
    if (!found) return null
    tmdbId = found
  }

  await sleep(150)
  return importMediaItem(base, token, tmdbId, item.mediaType)
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
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env.local')
  }

  console.log(`Connecting to ${base}...`)
  const token = await login(base, email, password)
  console.log('Authenticated.')

  const mediaTypeIds = await loadMediaTypeIds(base, token)
  console.log(`media-types — film: ${mediaTypeIds.movie}, series: ${mediaTypeIds.tv}\n`)

  const collections = COLLECTIONS.filter((c) => !SKIP_SLUGS.has(c.slug))
  const total = collections.length
  let globalAdded = 0
  let globalAlready = 0
  let globalErrors = 0
  let globalNotFound = 0

  for (let i = 0; i < collections.length; i++) {
    const col = collections[i]!
    const canImport = IMPORT_SLUGS.has(col.slug)
    process.stdout.write(`[${i + 1}/${total}] ${col.title}${canImport ? ' [import]' : ' [link-only]'} — `)

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
    let notFound = 0

    for (const item of col.items) {
      try {
        const mediaItemId = await resolveMediaItem(base, token, item, canImport, mediaTypeIds)

        if (mediaItemId === null) {
          process.stdout.write('?')
          notFound++
          if (!canImport) {
            console.warn(`\n  [NOT FOUND] "${item.title}" (${item.year}) — introuvable en base`)
          }
          continue
        }

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

    console.log(` — ${added} added, ${already} already linked, ${notFound} not found, ${errors} errors`)
    globalAdded += added
    globalAlready += already
    globalErrors += errors
    globalNotFound += notFound
  }

  const totalItems = collections.reduce((sum, c) => sum + c.items.length, 0)
  console.log(`\nDone. ${totalItems} items across ${total} collections.`)
  console.log(`  ${globalAdded} added, ${globalAlready} already linked, ${globalNotFound} not found, ${globalErrors} errors.`)

  if (globalNotFound > 0) {
    console.log(
      '  Items "not found" dans les collections link-only doivent être importés manuellement via Payload.',
    )
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
