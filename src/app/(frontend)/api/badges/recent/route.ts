import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers as nextHeaders } from 'next/headers'
import config from '@payload-config'
import type { Badge, UserBadge } from '@/payload-types'

type PopulatedUserBadge = Omit<UserBadge, 'badge'> & { badge: Badge }

export async function GET(req: NextRequest) {
  const since = req.nextUrl.searchParams.get('since')
  if (!since) {
    return NextResponse.json({ error: 'Missing since parameter' }, { status: 400 })
  }

  const sinceDate = new Date(since)
  if (isNaN(sinceDate.getTime())) {
    return NextResponse.json({ error: 'Invalid since parameter' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const headersList = await nextHeaders()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || user.collection !== 'customers') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await payload.find({
    collection: 'user-badges',
    where: {
      and: [
        { user: { equals: user.id } },
        { earned_at: { greater_than_equal: sinceDate.toISOString() } },
      ],
    },
    depth: 1,
    sort: '-earned_at',
    limit: 10,
    overrideAccess: true,
  })

  const badges = (result.docs as PopulatedUserBadge[]).map((ub) => ({
    id: ub.badge.id,
    title: ub.badge.title,
    icon_url: ub.badge.icon_url ?? null,
  }))

  return NextResponse.json({ badges })
}
