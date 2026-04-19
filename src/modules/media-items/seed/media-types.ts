import { getPayload } from 'payload'
import config from '../../../payload.config.ts'

async function seed() {
  const payload = await getPayload({ config })

  const types = [
    { slug: 'film', label: 'Film', display_order: 0 },
    { slug: 'series', label: 'Série', display_order: 1 },
  ]

  for (const type of types) {
    const existing = await payload.find({
      collection: 'media-types',
      where: { slug: { equals: type.slug } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({ collection: 'media-types', data: type })
      console.log(`Seeded media-type: ${type.slug}`)
    } else {
      console.log(`Skipped (exists): ${type.slug}`)
    }
  }

  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
