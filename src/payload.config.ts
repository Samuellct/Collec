import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { Admins } from './modules/auth/collections/Admins.ts'
import { Customers } from './modules/auth/collections/Customers.ts'
import { MediaTypes } from './modules/media-items/collections/MediaTypes.ts'
import { MediaItems } from './modules/media-items/collections/MediaItems.ts'
import { ExternalIds } from './modules/media-items/collections/ExternalIds.ts'
import { Collections } from './modules/collections/collections/Collections.ts'
import { CollectionItems } from './modules/collections/collections/CollectionItems.ts'
import { Pathways } from './modules/pathways/collections/Pathways.ts'
import { PathwaySteps } from './modules/pathways/collections/PathwaySteps.ts'
import { UserWatchedItems } from './modules/progress/collections/UserWatchedItems.ts'
import { UserCollectionProgress } from './modules/progress/collections/UserCollectionProgress.ts'
import { UserPathwayProgress } from './modules/progress/collections/UserPathwayProgress.ts'
import { Badges } from './modules/gamification/collections/Badges.ts'
import { UserBadges } from './modules/gamification/collections/UserBadges.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'admins',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  email: resendAdapter({
    defaultFromAddress: process.env.RESEND_FROM_ADDRESS ?? '',
    defaultFromName: process.env.RESEND_FROM_NAME ?? 'Collec Club',
    apiKey: process.env.RESEND_API_KEY ?? '',
  }),
  secret: process.env.PAYLOAD_SECRET ?? '',
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? '',
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI ?? '',
    },
    push: false,
    migrationDir: path.resolve(dirname, '../migrations'),
  }),
  collections: [Admins, Customers, MediaTypes, MediaItems, ExternalIds, Collections, CollectionItems, Pathways, PathwaySteps, UserWatchedItems, UserCollectionProgress, UserPathwayProgress, Badges, UserBadges],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  sharp,
})
