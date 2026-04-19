import { readFileSync } from 'fs'
import { resolve } from 'path'
import pg from 'pg'

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
    // .env.local absent : utiliser les variables d'environnement existantes
  }
}

const types = [
  { slug: 'film', label: 'Film', display_order: 0 },
  { slug: 'series', label: 'Série', display_order: 1 },
]

async function seed() {
  loadEnv()

  const connectionString = process.env.DATABASE_URI
  if (!connectionString) throw new Error('DATABASE_URI is not set')

  const client = new pg.Client({ connectionString })
  await client.connect()

  try {
    for (const type of types) {
      const res = await client.query(
        `INSERT INTO media_types (slug, label, display_order, updated_at, created_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING
         RETURNING slug`,
        [type.slug, type.label, type.display_order],
      )
      if (res.rowCount && res.rowCount > 0) {
        console.log(`Seeded: ${type.slug}`)
      } else {
        console.log(`Skipped (exists): ${type.slug}`)
      }
    }
  } finally {
    await client.end()
  }
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
