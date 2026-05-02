import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { PathwayTimeline } from '@/components/pathway/PathwayTimeline'
import { PathwayProgressBar } from '@/components/pathway/PathwayProgressBar'
import { markWatched, removeWatched } from './actions'
import type { PathwayStep, MediaItem, UserPathwayProgress } from '@/payload-types'

type Props = {
  params: Promise<{ slug: string }>
}

type PopulatedPathwayStep = PathwayStep & { media_item: MediaItem }

const accessibilityLabel: Record<string, string> = {
  accessible: 'Accessible',
  curieux: 'Curieux',
  cinephile: 'Cinéphile',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pathways',
    where: { slug: { equals: slug } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const pathway = result.docs[0]
  if (!pathway) return { title: 'Parcours introuvable · Collec Club' }
  return { title: `${pathway.title} · Collec Club` }
}

export default async function ParcourPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const pathwayResult = await payload.find({
    collection: 'pathways',
    where: { slug: { equals: slug }, is_published: { equals: true } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const pathway = pathwayResult.docs[0]
  if (!pathway) notFound()

  const stepsResult = await payload.find({
    collection: 'pathway-steps',
    where: { pathway: { equals: pathway.id } },
    sort: 'position',
    depth: 1,
    limit: 0,
    overrideAccess: true,
  })
  const steps = stepsResult.docs as PopulatedPathwayStep[]

  const user = await getCurrentUser()

  let watchedMap: Record<number, number> = {}
  let progress: UserPathwayProgress | null = null

  if (user) {
    const mediaItemIds = steps.map((s) => s.media_item.id)

    const [watchedResult, progressResult] = await Promise.all([
      mediaItemIds.length > 0
        ? payload.find({
            collection: 'user-watched-items',
            where: {
              and: [{ user: { equals: user.id } }, { media_item: { in: mediaItemIds } }],
            },
            depth: 0,
            limit: 500,
            overrideAccess: true,
          })
        : Promise.resolve({ docs: [] as never[] }),
      payload.find({
        collection: 'user-pathway-progress',
        where: {
          and: [{ user: { equals: user.id } }, { pathway: { equals: pathway.id } }],
        },
        depth: 0,
        limit: 1,
        overrideAccess: true,
      }),
    ])

    watchedMap = Object.fromEntries(
      watchedResult.docs.map((w) => [
        typeof w.media_item === 'number' ? w.media_item : w.media_item.id,
        w.id,
      ]),
    ) as Record<number, number>

    progress = progressResult.docs[0] ?? null
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 font-sans text-[0.8rem] text-[var(--muted)]">
        <Link href="/explorer" className="transition-colors hover:text-copper">
          Explorer
        </Link>
        <span>/</span>
        <span className="text-ink">{pathway.title}</span>
      </nav>

      {/* Hero */}
      <section className="border-b border-[var(--line)] pb-10 pt-11">
        <p className="mb-3 font-sans text-[0.77rem] font-bold uppercase tracking-[0.09em] text-[var(--accent)]">
          Parcours éditorial
        </p>

        <h1 className="mb-2 font-display text-[clamp(2.2rem,5vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.045em] text-ink">
          {pathway.title}
        </h1>

        {pathway.subtitle && (
          <p className="mb-5 font-display text-[clamp(1.1rem,2.5vw,1.45rem)] font-normal italic leading-[1.2] tracking-[-0.02em] text-[var(--muted)]">
            {pathway.subtitle}
          </p>
        )}

        <div className="mb-7 flex flex-wrap items-center gap-x-2 gap-y-[14px] font-sans text-[0.88rem] text-[var(--muted)]">
          <span className="rounded-[3px] bg-[var(--accent-soft)] px-[9px] py-[2px] text-[0.77rem] font-semibold text-[var(--accent)]">
            {accessibilityLabel[pathway.accessibility_level]}
          </span>
          <span>
            {steps.length} étape{steps.length > 1 ? 's' : ''}
          </span>
          {pathway.estimated_duration_hours && (
            <>
              <span className="text-[var(--line-strong)]">·</span>
              <span>Environ {pathway.estimated_duration_hours}h de visionnage</span>
            </>
          )}
        </div>

        {user && progress && (
          <div className="mb-7">
            <PathwayProgressBar progress={progress} />
          </div>
        )}

        <div className="max-w-[680px] font-serif text-[1.02rem] leading-[1.75]">
          {pathway.introduction.split('\n').map((para, i) => (
            <p key={i} className={i > 0 ? 'mt-4' : ''}>
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="pt-12">
        <PathwayTimeline
          steps={steps}
          watchedMap={watchedMap}
          markWatched={markWatched}
          removeWatched={removeWatched}
          pathwaySlug={slug}
          isAuthenticated={!!user}
        />
      </section>
    </div>
  )
}
