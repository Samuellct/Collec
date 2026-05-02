import Link from 'next/link'

interface HeroSectionProps {
  user: { pseudo: string; filmsVus: number } | null
}

export function HeroSection({ user }: HeroSectionProps) {
  if (user) {
    return (
      <section className="border-b px-6 py-10" style={{ borderColor: 'var(--line)' }}>
        <h1 className="mb-5 font-display text-[1.75rem] font-bold leading-[1.1] tracking-[-0.04em] text-ink">
          Bonjour, {user.pseudo}.
        </h1>
        <div className="flex flex-wrap gap-8">
          <div>
            <span
              className="block font-display text-[2.2rem] font-bold leading-none tracking-[-0.05em]"
              style={{ color: 'var(--accent)' }}
            >
              {user.filmsVus}
            </span>
            <span className="mt-1 block font-sans text-[0.78rem]" style={{ color: 'var(--muted)' }}>
              {user.filmsVus === 1 ? 'oeuvre vue' : 'oeuvres vues'}
            </span>
          </div>
        </div>
        <div className="mt-6">
          <Link
            href="/explorer"
            className="inline-block rounded-[4px] border px-5 py-2.5 font-sans text-[0.88rem] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            style={{ borderColor: 'var(--line-strong)', color: 'var(--muted)' }}
          >
            Découvrir de nouvelles collections
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="border-b px-6 py-14 sm:py-20" style={{ borderColor: 'var(--line)' }}>
      <h1 className="mb-4 max-w-[600px] font-display text-[2.2rem] font-bold leading-[1.1] tracking-[-0.04em] text-ink sm:text-[2.8rem]">
        Construis ta culture, film après film.
      </h1>
      <p
        className="mb-8 max-w-[460px] font-serif text-[1rem] leading-[1.65]"
        style={{ color: 'var(--muted)' }}
      >
        Complète des collections de films et de séries. Suis des parcours éditoriaux. Oeuvre après oeuvre.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/inscription"
          className="rounded-[4px] px-5 py-2.5 font-sans text-[0.88rem] font-medium text-white transition-colors hover:bg-[var(--accent-h)]"
          style={{ background: 'var(--accent)' }}
        >
          Commence ta collec
        </Link>
        <Link
          href="/explorer"
          className="rounded-[4px] border px-5 py-2.5 font-sans text-[0.88rem] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          style={{ borderColor: 'var(--line-strong)', color: 'var(--muted)' }}
        >
          Découvrir
        </Link>
      </div>
    </section>
  )
}
