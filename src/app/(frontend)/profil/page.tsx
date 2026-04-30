import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/get-current-user'

function formatMemberSince(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(
    new Date(dateStr),
  )
}

export default async function ProfilPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?next=/profil')
  }

  const pseudo = user.pseudo ?? 'Utilisateur'
  const initial = pseudo[0].toUpperCase()

  return (
    <main className="mx-auto max-w-[1080px] px-6">
      {/* Profile header */}
      <div className="border-b py-10" style={{ borderColor: 'var(--line)' }}>
        <div className="mb-7 flex items-start gap-5">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-display text-[1.4rem] font-bold leading-none text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--bordeaux) 100%)' }}
            aria-hidden="true"
          >
            {initial}
          </div>
          <div>
            <h1 className="font-display text-[1.75rem] font-bold leading-[1.1] tracking-[-0.04em] text-ink">
              {pseudo}
            </h1>
            <p className="mt-1 font-sans text-[0.83rem]" style={{ color: 'var(--muted)' }}>
              Membre depuis {formatMemberSince(user.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-[1fr_320px] items-start gap-12 py-10 max-[800px]:grid-cols-1 max-[800px]:gap-8">
        <div>{/* Main column — content à venir */}</div>
        <aside>{/* Sidebar — content à venir */}</aside>
      </div>
    </main>
  )
}
