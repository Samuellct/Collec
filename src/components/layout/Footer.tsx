import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] px-6 py-10">
      <div className="mx-auto max-w-[1080px] flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-display text-[1rem] font-semibold tracking-[-0.02em] text-ink">
            Collec Club
          </span>
          <span className="font-sans text-[0.83rem] text-[var(--muted)]">
            La culture à compléter.
          </span>
        </div>

        <div className="flex flex-col gap-3 font-sans text-[0.78rem] text-[var(--muted)]">
          <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
          <p>Données de streaming fournies par JustWatch.</p>
          <div className="flex items-center gap-3">
            <Link href="/mentions-legales" className="hover:text-copper transition-colors">
              Mentions légales
            </Link>
            <span aria-hidden>·</span>
            <Link href="/politique-confidentialite" className="hover:text-copper transition-colors">
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
