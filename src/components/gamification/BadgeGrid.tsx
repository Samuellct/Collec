import Image from 'next/image'
import type { Badge, UserBadge } from '@/payload-types'

type PopulatedUserBadge = Omit<UserBadge, 'badge'> & { badge: Badge }

interface BadgeGridProps {
  userBadges: PopulatedUserBadge[]
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(dateStr),
  )
}

export function BadgeGrid({ userBadges }: BadgeGridProps) {
  if (userBadges.length === 0) {
    return (
      <p className="font-serif text-[0.9rem]" style={{ color: 'var(--muted)' }}>
        Aucun badge pour l&apos;instant. Continue à explorer !
      </p>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
      {userBadges.map((ub) => (
        <BadgeItem key={ub.id} userBadge={ub} />
      ))}
    </div>
  )
}

function BadgeItem({ userBadge }: { userBadge: PopulatedUserBadge }) {
  const { badge, earned_at } = userBadge

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div
        style={{
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '50%',
          background: 'var(--laiton-soft, #f5eed6)',
          border: '2px solid var(--laiton, #B5964D)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        {badge.icon_url ? (
          <Image
            src={badge.icon_url}
            alt=""
            width={36}
            height={36}
            style={{ objectFit: 'contain' }}
          />
        ) : (
          <DefaultBadgeIcon />
        )}
      </div>

      <div>
        <p className="font-sans text-[0.78rem] font-semibold leading-tight text-ink">
          {badge.title}
        </p>
        <p className="mt-0.5 font-sans text-[0.68rem] leading-snug" style={{ color: 'var(--muted)' }}>
          {formatDate(earned_at)}
        </p>
      </div>
    </div>
  )
}

function DefaultBadgeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 13c-3.31 0-6-2.69-6-6V3h12v4c0 3.31-2.69 6-6 6z"
        stroke="#B5964D"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M4 5H2v2a2 2 0 0 0 2 2M16 5h2v2a2 2 0 0 1-2 2"
        stroke="#B5964D"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M10 13v3M7 16h6" stroke="#B5964D" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
