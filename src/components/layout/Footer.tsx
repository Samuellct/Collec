import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] px-6 py-5 sm:py-8">
      <div className="mx-auto max-w-[1080px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="flex items-baseline gap-3 sm:flex-col sm:items-start sm:gap-0.5">
            <span className="font-display text-[0.95rem] font-semibold tracking-[-0.02em] text-ink">
              Collec Club
            </span>
            <span className="font-sans text-[0.78rem] text-[var(--muted)]">
              La culture à compléter.
            </span>
          </div>

          <div className="flex flex-col gap-1.5 font-sans text-[0.74rem] text-[var(--muted)] sm:gap-2 sm:text-[0.76rem]">
            <div className="flex flex-wrap items-center gap-1.5">
              <Image
                src="/tmdb.svg"
                alt="TMDB"
                width={76}
                height={32}
                className="h-4 w-auto"
                unoptimized
              />
              <span>This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
            </div>
            <p>Données de streaming fournies par JustWatch.</p>
            <div className="flex items-center gap-2.5">
              <Link href="/mentions-legales" className="transition-colors hover:text-copper">
                Mentions légales
              </Link>
              <span aria-hidden>·</span>
              <Link href="/politique-confidentialite" className="transition-colors hover:text-copper">
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
