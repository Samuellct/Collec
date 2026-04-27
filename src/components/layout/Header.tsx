import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { AuthMenu } from '@/components/auth/AuthMenu'

export async function Header() {
  const user = await getCurrentUser()

  return (
    <header className="border-b border-[var(--line)] px-6 py-4">
      <div className="mx-auto flex max-w-[1080px] items-center justify-between">
        <Link
          href="/"
          className="font-display text-[1.1rem] font-semibold tracking-[-0.025em] text-ink hover:text-copper transition-colors"
        >
          Collec Club
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
