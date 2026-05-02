import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { AuthMenu } from '@/components/auth/AuthMenu'

export async function Header() {
  const user = await getCurrentUser()

  return (
    <header className="border-b border-[var(--line)] px-6 py-4">
      <div className="mx-auto flex max-w-[1080px] items-center justify-between">
        <Link href="/" aria-label="Collec Club, page d'accueil">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 520 150"
            role="img"
            aria-hidden="true"
            className="h-8 w-auto"
          >
            <defs>
              <style>{`.wm{font-family:var(--font-kalam),cursive;font-weight:700;font-size:84px}`}</style>
            </defs>
            <text x="24" y="100" className="wm" fill="#1A1C1E">Collec</text>
            <text x="290" y="100" className="wm" fill="#B85C38">Club</text>
            <line x1="26" y1="118" x2="494" y2="118" stroke="#B85C38" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/explorer"
            className="font-sans text-[0.88rem] text-slate hover:text-copper transition-colors"
          >
            Découvrir
          </Link>
        </nav>

        <AuthMenu user={user} />
      </div>
    </header>
  )
}
